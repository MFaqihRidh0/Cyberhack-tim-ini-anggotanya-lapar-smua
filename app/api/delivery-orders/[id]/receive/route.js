import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { logAudit } from '@/lib/server/audit';

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'OPERATOR', 'MANAGER')) return forbidden();

  const { id } = await params;

  const { data: order } = await supabase.from('delivery_orders').select('*').eq('id', id).single();
  if (!order) return Response.json({ success: false, data: null, message: 'Delivery Order not found' }, { status: 404 });

  if (order.status === 'RECEIVED') {
    return Response.json({ success: false, data: null, message: 'DO already received' }, { status: 400 });
  }

  // Update all INCOMING lots linked to this DO → RECEIVED
  const { data: lots } = await supabase.from('raw_material_lots')
    .select('id')
    .eq('delivery_order_id', id)
    .eq('current_status', 'INCOMING');

  let updatedCount = 0;
  for (const lot of (lots || [])) {
    await supabase.from('raw_material_lots').update({ current_status: 'RECEIVED' }).eq('id', lot.id);
    await supabase.from('raw_lot_stages').insert({
      raw_lot_id: lot.id, stage: 'RECEIVED', actor_id: user.id, notes: `Received via ${order.do_number}`,
    });
    updatedCount++;
  }

  // Update DO status
  await supabase.from('delivery_orders').update({
    status: 'RECEIVED',
    received_date: new Date().toISOString(),
  }).eq('id', id);

  await logAudit({
    action: 'RECEIVE', entityType: 'DELIVERY_ORDER', entityId: id,
    description: `${order.do_number} received — ${updatedCount} lots updated to RECEIVED`,
    metadata: { lots_updated: updatedCount },
    user,
  });

  return Response.json({
    success: true,
    data: { id, status: 'RECEIVED', lots_updated: updatedCount },
    message: `DO received! ${updatedCount} lots updated to RECEIVED.`,
  });
}
