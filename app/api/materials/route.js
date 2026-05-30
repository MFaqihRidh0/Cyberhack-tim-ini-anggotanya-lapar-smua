import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { data } = await supabase.from('materials').select('*').eq('is_active', true).order('name');
  return Response.json({ success: true, data: data || [], message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'MANAGER')) return forbidden();

  const body = await request.json();
  const { name, code, category, unit, shelf_life_days, storage_note } = body;
  if (!name || !code || !category || !unit) {
    return Response.json({ success: false, data: null, message: 'name, code, category, unit wajib diisi' }, { status: 400 });
  }

  const { data, error } = await supabase.from('materials').insert({ name, code, category, unit, shelf_life_days, storage_note }).select().single();
  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });
  return Response.json({ success: true, data, message: 'Material berhasil dibuat' }, { status: 201 });
}
