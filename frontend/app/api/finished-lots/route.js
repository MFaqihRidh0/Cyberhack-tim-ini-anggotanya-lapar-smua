import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const where = status ? { currentStatus: status } : {};

  const lots = await prisma.finishedGoodsLot.findMany({
    where,
    include: { product: true, productionOrder: { select: { id: true, orderNumber: true } }, _count: { select: { sampleDispatches: true } } },
    orderBy: { producedAt: 'desc' },
  });

  return Response.json({ success: true, data: lots, message: 'Berhasil' });
}
