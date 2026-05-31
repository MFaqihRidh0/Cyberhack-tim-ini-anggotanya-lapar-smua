import { verifyAuth, unauthorized } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  return Response.json({ success: true, data: user, message: 'Berhasil' });
}
