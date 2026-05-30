import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { generateLotNumber } from '@/lib/server/lotNumber';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const dispatches = await prisma.sampleDispatch.findMany({
    include: { finishedLot: { include: { product: true } }, dispatchedBy: { select: { id: true, name: true } } },
    orderBy: { dispatchDate: 'desc' },
  });
  return Response.json({ success: true, data: dispatches, message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'MANAGER')) return forbidden();

  const body = await request.json();
  const { finishedLotId, customerName, customerEmail, customerPhone, destination, country, quantity, unit, trackingNumber, notes } = body;

  if (!finishedLotId || !customerName || !quantity || !destination) {
    return Response.json({ success: false, data: null, message: 'finishedLotId, customerName, quantity, destination wajib diisi' }, { status: 400 });
  }
  if (destination === 'EXPORT' && !country) {
    return Response.json({ success: false, data: null, message: 'country wajib diisi untuk EXPORT' }, { status: 400 });
  }

  const lot = await prisma.finishedGoodsLot.findUnique({ where: { id: finishedLotId } });
  if (!lot) return Response.json({ success: false, data: null, message: 'Finished Lot tidak ditemukan' }, { status: 404 });

  const dispatchNumber = await generateLotNumber('SD');
  const newStatus = Number(quantity) >= lot.quantity ? 'FULLY_DISPATCHED' : 'PARTIALLY_DISPATCHED';

  const dispatch = await prisma.$transaction(async (tx) => {
    const d = await tx.sampleDispatch.create({
      data: { dispatchNumber, finishedLotId, customerName, customerEmail, customerPhone, destination, country: destination === 'EXPORT' ? country : null, quantity: Number(quantity), unit: unit || lot.unit, trackingNumber, notes, dispatchedById: user.id },
    });
    await tx.finishedGoodsLot.update({ where: { id: finishedLotId }, data: { currentStatus: newStatus } });
    await tx.finishedLotStage.create({ data: { finishedLotId, stage: newStatus, actorId: user.id, notes: `Dispatch ke ${customerName}` } });
    return d;
  });

  return Response.json({ success: true, data: dispatch, message: 'Sample Dispatch berhasil dibuat' }, { status: 201 });
}
