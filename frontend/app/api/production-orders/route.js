import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { generateLotNumber } from '@/lib/server/lotNumber';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const where = status ? { status } : {};

  const orders = await prisma.productionOrder.findMany({
    where,
    include: { product: true, createdBy: { select: { id: true, name: true } }, _count: { select: { inputs: true, finishedLots: true } } },
    orderBy: [{ priority: 'desc' }, { scheduledDate: 'asc' }],
  });
  return Response.json({ success: true, data: orders, message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'PPIC', 'MANAGER')) return forbidden();

  const body = await request.json();
  const { productId, targetQty, scheduledDate, priority, notes } = body;
  if (!productId || !targetQty) {
    return Response.json({ success: false, data: null, message: 'productId dan targetQty wajib diisi' }, { status: 400 });
  }

  const orderNumber = await generateLotNumber('PO');
  const order = await prisma.productionOrder.create({
    data: {
      orderNumber, productId, targetQty: Number(targetQty), createdById: user.id,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      priority: priority ? Number(priority) : 0, notes,
    },
    include: { product: true },
  });

  return Response.json({ success: true, data: order, message: 'Production Order berhasil dibuat' }, { status: 201 });
}
