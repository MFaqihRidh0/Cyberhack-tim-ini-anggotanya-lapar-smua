import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

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
  const { do_number, supplier_id, received_date, notes } = body;
  // Support both camelCase and snake_case from frontend
  const doNumber = do_number || body.doNumber;
  const supplierId = supplier_id || body.supplierId;

  if (!doNumber || !supplierId) {
    return Response.json({ success: false, data: null, message: 'doNumber dan supplierId wajib diisi' }, { status: 400 });
  }

  const { data, error } = await supabase.from('delivery_orders')
    .insert({ do_number: doNumber, supplier_id: supplierId, received_date: received_date || new Date().toISOString(), notes })
    .select('*, supplier:suppliers(*)')
    .single();

  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });
  return Response.json({ success: true, data, message: 'Delivery Order berhasil dibuat' }, { status: 201 });
}
