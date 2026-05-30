import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase.from('finished_goods_lots').select('*, product:products(*), production_order:production_orders(id, order_number)').order('produced_at', { ascending: false });
  if (status) query = query.eq('current_status', status);

  const { data } = await query;
  return Response.json({ success: true, data: data || [], message: 'Berhasil' });
}
