import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { generateLotNumber } from '@/lib/server/lotNumber';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase.from('production_orders').select('*, product:products(*), created_by:users(id, name)').order('priority', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data } = await query;
  return Response.json({ success: true, data: data || [], message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'PPIC', 'MANAGER')) return forbidden();

  const body = await request.json();
  const productId = body.product_id || body.productId;
  const targetQty = body.target_qty || body.targetQty;

  if (!productId || !targetQty) {
    return Response.json({ success: false, data: null, message: 'productId dan targetQty wajib diisi' }, { status: 400 });
  }

  const order_number = await generateLotNumber('PO');
  const { data, error } = await supabase.from('production_orders').insert({
    order_number, product_id: productId, target_qty: Number(targetQty), created_by_id: user.id,
    status: 'QUEUED',
    scheduled_date: body.scheduledDate || body.scheduled_date || null,
    priority: body.priority ? Number(body.priority) : 0, notes: body.notes || null,
  }).select('*, product:products(*)').single();

  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });
  return Response.json({ success: true, data, message: 'Production Order berhasil dibuat' }, { status: 201 });
}
