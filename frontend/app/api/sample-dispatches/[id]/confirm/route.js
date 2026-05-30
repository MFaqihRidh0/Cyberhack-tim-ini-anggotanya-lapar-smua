import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'MANAGER')) return forbidden();

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const dispatch = await prisma.sampleDispatch.findUnique({ where: { id } });
  if (!dispatch) return Response.json({ success: false, data: null, message: 'Dispatch tidak ditemukan' }, { status: 404 });

  const updated = await prisma.sampleDispatch.update({
    where: { id },
    data: { receivedConfirmed: true, receivedAt: body.receivedAt ? new Date(body.receivedAt) : new Date() },
  });

  return Response.json({ success: true, data: updated, message: 'Dispatch dikonfirmasi' });
}
