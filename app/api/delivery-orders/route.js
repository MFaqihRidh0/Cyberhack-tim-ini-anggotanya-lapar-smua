import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { generateLotNumber } from '@/lib/server/lotNumber';
import { logAudit } from '@/lib/server/audit';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { data } = await supabase.from('delivery_orders').select('*, supplier:suppliers(*)').order('received_date', { ascending: false });

  // For each DO, get count of raw lots
  if (data) {
    for (const d of data) {
      const { data: lots } = await supabase.from('raw_material_lots').select('id').eq('delivery_order_id', d.id);
      d.raw_lot_count = lots?.length || 0;
    }
  }

  return Response.json({ success: true, data: data || [], message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'OPERATOR', 'MANAGER')) return forbidden();

  const body = await request.json();
  const supplierId = body.supplier_id || body.supplierId;
  const items = body.items || []; // Array of { materialId, qty, supplierLotNo?, expiryDate? }
  const notes = body.notes || null;

  if (!supplierId) {
    return Response.json({ success: false, data: null, message: 'Supplier wajib dipilih' }, { status: 400 });
  }
  if (items.length === 0) {
    return Response.json({ success: false, data: null, message: 'Minimal 1 item material harus ditambahkan' }, { status: 400 });
  }

  // Auto-generate DO number
  const doNumber = await generateLotNumber('DO');

  // Create the delivery order
  const { data: order, error } = await supabase.from('delivery_orders')
    .insert({ do_number: doNumber, supplier_id: supplierId, notes })
    .select('*, supplier:suppliers(*)')
    .single();

  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });

  // Auto-create Raw Material Lots for each item
  const createdLots = [];
  for (const item of items) {
    const materialId = item.materialId || item.material_id;
    const qty = Number(item.qty || item.initialQty || item.initial_qty);

    if (!materialId || !qty) continue;

    const lotNo = await generateLotNumber('SA-RM');

    const { data: lot } = await supabase.from('raw_material_lots').insert({
      internal_lot_no: lotNo,
      supplier_lot_no: item.supplierLotNo || item.supplier_lot_no || null,
      initial_qty: qty,
      current_status: 'INCOMING',
      delivery_order_id: order.id,
      supplier_id: supplierId,
      material_id: materialId,
      created_by_id: user.id,
      expiry_date: item.expiryDate || item.expiry_date || null,
      notes: item.notes || null,
    }).select('*, material:materials(name, unit)').single();

    if (lot) {
      await supabase.from('raw_lot_stages').insert({
        raw_lot_id: lot.id, stage: 'INCOMING', actor_id: user.id, notes: `Diterima via ${doNumber}`,
      });
      createdLots.push(lot);
    }
  }

  await logAudit({
    action: 'CREATE', entityType: 'DELIVERY_ORDER', entityId: order.id,
    description: `${doNumber} — ${items.length} item dari ${order.supplier?.name}`,
    metadata: { do_number: doNumber, items_count: items.length, lots_created: createdLots.length },
    user,
  });

  return Response.json({
    success: true,
    data: { ...order, rawLots: createdLots },
    message: `Delivery Order ${doNumber} berhasil dibuat dengan ${createdLots.length} lot`,
  }, { status: 201 });
}
