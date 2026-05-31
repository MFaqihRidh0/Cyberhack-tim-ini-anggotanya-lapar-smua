import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { generateLotNumber } from '@/lib/server/lotNumber';
import { logAudit } from '@/lib/server/audit';

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'OPERATOR', 'MANAGER')) return forbidden();

  const { id } = await params;

  // Get the DO
  const { data: order } = await supabase.from('delivery_orders').select('*').eq('id', id).single();
  if (!order) return Response.json({ success: false, data: null, message: 'Delivery Order not found' }, { status: 404 });

  if (order.status === 'RECEIVED') {
    return Response.json({ success: false, data: null, message: 'DO already received' }, { status: 400 });
  }

  // Extract items from notes (stored as JSON after ---ITEMS---)
  let items = [];
  if (order.notes && order.notes.includes('---ITEMS---')) {
    const parts = order.notes.split('---ITEMS---');
    try {
      items = JSON.parse(parts[1].trim());
    } catch { /* ignore parse errors */ }
  }

  if (items.length === 0) {
    return Response.json({ success: false, data: null, message: 'No items found in this DO' }, { status: 400 });
  }

  // Create Raw Material Lots for each item
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
      current_status: 'RECEIVED',
      delivery_order_id: order.id,
      supplier_id: order.supplier_id,
      material_id: materialId,
      created_by_id: user.id,
      expiry_date: item.expiryDate || item.expiry_date || null,
    }).select('*, material:materials(name, unit)').single();

    if (lot) {
      await supabase.from('raw_lot_stages').insert({
        raw_lot_id: lot.id, stage: 'RECEIVED', actor_id: user.id, notes: `Received via ${order.do_number}`,
      });
      createdLots.push(lot);
    }
  }

  // Update DO status to RECEIVED and clean notes
  const cleanNotes = order.notes ? order.notes.split('---ITEMS---')[0].trim() : null;
  await supabase.from('delivery_orders').update({
    status: 'RECEIVED',
    received_date: new Date().toISOString(),
    notes: cleanNotes || null,
  }).eq('id', id);

  await logAudit({
    action: 'RECEIVE', entityType: 'DELIVERY_ORDER', entityId: id,
    description: `${order.do_number} received — ${createdLots.length} lots created`,
    metadata: { lots_created: createdLots.length },
    user,
  });

  return Response.json({
    success: true,
    data: { id, status: 'RECEIVED', lots_created: createdLots.length },
    message: `DO received! ${createdLots.length} Raw Material Lots created.`,
  });
}
