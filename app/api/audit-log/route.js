import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'MANAGER')) return forbidden('Hanya Manager yang bisa melihat audit log');

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entity_type');
  const entityId = searchParams.get('entity_id');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(limit);
  if (entityType) query = query.eq('entity_type', entityType);
  if (entityId) query = query.eq('entity_id', entityId);

  const { data, error } = await query;

  if (error) {
    // Table might not exist yet
    return Response.json({ success: true, data: [], message: 'Audit log belum tersedia' });
  }

  return Response.json({ success: true, data: data || [], message: 'Berhasil' });
}
