import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'MANAGER')) return forbidden();

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const { data, error } = await supabase.from('sample_dispatches')
    .update({ received_confirmed: true, received_at: body.receivedAt || new Date().toISOString() })
    .eq('id', id).select().single();

  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });
  return Response.json({ success: true, data, message: 'Dispatch dikonfirmasi' });
}
