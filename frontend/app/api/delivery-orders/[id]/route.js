import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized } from '@/lib/server/auth';

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const order = await prisma.deliveryOrder.findUnique({
    where: { id },
    include: { supplier: true, rawLots: { include: { material: true } } },
  });

  if (!order) return Response.json({ success: false, data: null, message: 'Delivery Order tidak ditemukan' }, { status: 404 });
  return Response.json({ success: true, data: order, message: 'Berhasil' });
}
