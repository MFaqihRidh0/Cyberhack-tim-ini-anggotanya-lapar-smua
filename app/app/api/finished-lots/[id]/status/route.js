import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden } from '@/lib/server/auth';

const VALID_TRANSITIONS = {
  PRODUCED: ['QC_PENDING'],
  QC_PENDING: ['QC_APPROVED', 'QC_REJECTED'],
  QC_APPROVED: ['IN_WAREHOUSE'],
  IN_WAREHOUSE: ['PARTIALLY_DISPATCHED', 'FULLY_DISPATCHED'],
};

const STATUS_ROLE = {
  QC_PENDING: ['PPIC', 'MANAGER'],
  QC_APPROVED: ['QC_STAFF', 'MANAGER'],
  QC_REJECTED: ['QC_STAFF', 'MANAGER'],
  IN_WAREHOUSE: ['OPERATOR', 'MANAGER'],
};

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { status, notes } = await request.json();

  if (!status) return Response.json({ success: false, data: null, message: 'status required' }, { status: 400 });

  const { data: lot } = await supabase.from('finished_goods_lots').select('id, current_status').eq('id', id).single();
  if (!lot) return Response.json({ success: false, data: null, message: 'Lot not found' }, { status: 404 });

  const allowed = VALID_TRANSITIONS[lot.current_status] || [];
  if (!allowed.includes(status)) {
    return Response.json({ success: false, data: null, message: `Cannot transition from ${lot.current_status} to ${status}` }, { status: 400 });
  }

  const allowedRoles = STATUS_ROLE[status] || [];
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return forbidden(`Role ${user.role} cannot set status to ${status}`);
  }

  await supabase.from('finished_goods_lots').update({ current_status: status }).eq('id', id);
  await supabase.from('finished_lot_stages').insert({ finished_lot_id: id, stage: status, actor_id: user.id, notes: notes || `Status changed to ${status}` });

  return Response.json({ success: true, data: { id, current_status: status }, message: `Status updated to ${status}` });
}
