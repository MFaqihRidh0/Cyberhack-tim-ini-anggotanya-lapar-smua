import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const orders = await prisma.deliveryOrder.findMany({
    include: { supplier: true, _count: { select: { rawLots: true } } },
    orderBy: { receivedDate: 'desc' },
  });
  return Response.json({ success: true, data: orders, message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'OPERATOR', 'MANAGER')) return forbidden();

  const body = await request.json();
  const { doNumber, supplierId, receivedDate, notes } = body;
  if (!doNumber || !supplierId) {
    return Response.json({ success: false, data: null, message: 'doNumber dan supplierId wajib diisi' }, { status: 400 });
  }

  const order = await prisma.deliveryOrder.create({
    data: { doNumber, supplierId, receivedDate: receivedDate ? new Date(receivedDate) : undefined, notes },
    include: { supplier: true },
  });
  return Response.json({ success: true, data: order, message: 'Delivery Order berhasil dibuat' }, { status: 201 });
}
