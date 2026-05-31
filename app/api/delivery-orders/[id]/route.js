import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized } from '@/lib/server/auth';

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;

  const { data: order } = await supabase.from('delivery_orders')
    .select('*, supplier:suppliers(*)')
    .eq('id', id)
    .single();

  if (!order) return Response.json({ success: false, data: null, message: 'Delivery Order not found' }, { status: 404 });

  // Get raw lots linked to this DO
  const { data: rawLots } = await supabase.from('raw_material_lots')
    .select('*, material:materials(name, unit, code)')
    .eq('delivery_order_id', id)
    .order('date_created', { ascending: false });

  return Response.json({ success: true, data: { ...order, rawLots: rawLots || [] }, message: 'Berhasil' });
}
