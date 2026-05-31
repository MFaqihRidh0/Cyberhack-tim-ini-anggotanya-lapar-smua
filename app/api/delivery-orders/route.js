import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { generateLotNumber } from '@/lib/server/lotNumber';
import { logAudit } from '@/lib/server/audit';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { data } = await supabase.from('delivery_orders').select('*, supplier:suppliers(*)').order('received_date', { ascending: false });
  return Response.json({ success: true, data: data || [], message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'OPERATOR', 'MANAGER')) return forbidden();

  const body = await request.json();
  const supplierId = body.supplier_id || body.supplierId;
  const items = body.items || [];
  const notes = body.notes || null;

  if (!supplierId) {
    return Response.json({ success: false, data: null, message: 'Supplier wajib dipilih' }, { status: 400 });
  }
  if (items.length === 0) {
    return Response.json({ success: false, data: null, message: 'Minimal 1 item material harus ditambahkan' }, { status: 400 });
  }

  // Auto-generate DO number
  const doNumber = await generateLotNumber('DO');

  // Create the delivery order with status INCOMING (lots NOT created yet)
  const { data: order, error } = await supabase.from('delivery_orders')
    .insert({ do_number: doNumber, supplier_id: supplierId, notes, status: 'INCOMING' })
    .select('*, supplier:suppliers(*)')
    .single();

  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });

  // Store items as JSON metadata in notes or a separate field
  // For now, store items temporarily in a delivery_order_items approach
  // We'll save items info in the DO notes as structured data for later use
  const itemsJson = JSON.stringify(items);
  await supabase.from('delivery_orders').update({ notes: notes ? `${notes}\n---ITEMS---\n${itemsJson}` : `---ITEMS---\n${itemsJson}` }).eq('id', order.id);

  await logAudit({
    action: 'CREATE', entityType: 'DELIVERY_ORDER', entityId: order.id,
    description: `${doNumber} — ${items.length} item dari ${order.supplier?.name} (INCOMING)`,
    metadata: { do_number: doNumber, items_count: items.length, status: 'INCOMING' },
    user,
  });

  return Response.json({
    success: true,
    data: { ...order, items },
    message: `Delivery Order ${doNumber} dibuat (status: INCOMING). Klik "Receive" untuk menambahkan ke Raw Material Lots.`,
  }, { status: 201 });
}
