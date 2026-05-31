import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { data } = await supabase.from('suppliers').select('*').eq('is_active', true).order('name');
  return Response.json({ success: true, data: data || [], message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'MANAGER')) return forbidden();

  const body = await request.json();
  const { name, code, contact_name, phone, email, address } = body;
  if (!name || !code) {
    return Response.json({ success: false, data: null, message: 'name dan code wajib diisi' }, { status: 400 });
  }

  const { data, error } = await supabase.from('suppliers').insert({ name, code, contact_name, phone, email, address, is_active: true }).select().single();
  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });
  return Response.json({ success: true, data, message: 'Supplier berhasil dibuat' }, { status: 201 });
}
