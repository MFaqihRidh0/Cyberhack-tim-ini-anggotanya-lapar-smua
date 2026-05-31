import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'MANAGER')) return forbidden();

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  // Get the dispatch to find the finished lot
  const { data: dispatch } = await supabase.from('sample_dispatches').select('finished_lot_id').eq('id', id).single();

  const { data, error } = await supabase.from('sample_dispatches')
    .update({ received_confirmed: true, received_at: body.receivedAt || new Date().toISOString() })
    .eq('id', id).select().single();

  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });

  // Update finished lot to FULLY_DISPATCHED on confirmation
  if (dispatch?.finished_lot_id) {
    await supabase.from('finished_goods_lots').update({ current_status: 'FULLY_DISPATCHED' }).eq('id', dispatch.finished_lot_id);
    await supabase.from('finished_lot_stages').insert({ finished_lot_id: dispatch.finished_lot_id, stage: 'FULLY_DISPATCHED', actor_id: user.id, notes: 'Dispatch confirmed by customer' });
  }

  return Response.json({ success: true, data, message: 'Dispatch confirmed — status updated to FULLY DISPATCHED' });
}
