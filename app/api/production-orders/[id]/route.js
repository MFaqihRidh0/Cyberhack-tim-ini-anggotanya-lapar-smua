import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { generateLotNumber } from '@/lib/server/lotNumber';

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const order = await prisma.productionOrder.findUnique({
    where: { id },
    include: {
      product: true, createdBy: { select: { id: true, name: true } },
      inputs: { include: { rawLot: { select: { id: true, internalLotNo: true, currentStatus: true } }, material: true } },
      finishedLots: true,
    },
  });

  if (!order) return Response.json({ success: false, data: null, message: 'Production Order tidak ditemukan' }, { status: 404 });
  return Response.json({ success: true, data: order, message: 'Berhasil' });
}

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'PPIC', 'MANAGER')) return forbidden();

  const { id } = await params;
  const body = await request.json();
  const { status, scheduledDate, priority, actualQty, notes } = body;

  const order = await prisma.productionOrder.findUnique({ where: { id }, include: { product: true, inputs: { include: { rawLot: { include: { productionInputs: true } } } } } });
  if (!order) return Response.json({ success: false, data: null, message: 'PO tidak ditemukan' }, { status: 404 });

  const updateData = {};
  if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
  if (priority !== undefined) updateData.priority = Number(priority);
  if (notes !== undefined) updateData.notes = notes;

  if (status) {
    updateData.status = status;
    if (status === 'IN_PROGRESS') updateData.startedAt = new Date();

    if (status === 'COMPLETED') {
      if (!actualQty) return Response.json({ success: false, data: null, message: 'actualQty wajib diisi saat COMPLETED' }, { status: 400 });
      updateData.actualQty = Number(actualQty);
      updateData.completedAt = new Date();

      // Auto-create FinishedGoodsLot
      const lotNumber = await generateLotNumber('SA-FG');
      await prisma.$transaction(async (tx) => {
        await tx.productionOrder.update({ where: { id }, data: updateData });

        const fg = await tx.finishedGoodsLot.create({
          data: { lotNumber, productId: order.productId, productionOrderId: id, quantity: Number(actualQty), unit: order.product.unit, currentStatus: 'PRODUCED' },
        });
        await tx.finishedLotStage.create({ data: { finishedLotId: fg.id, stage: 'PRODUCED', actorId: user.id, notes: 'Produksi selesai' } });

        // Update raw lots to CONSUMED if fully used
        for (const input of order.inputs) {
          const totalUsed = input.rawLot.productionInputs.reduce((s, i) => s + i.qtyUsed, 0);
          if (totalUsed >= input.rawLot.initialQty) {
            await tx.rawMaterialLot.update({ where: { id: input.rawLotId }, data: { currentStatus: 'CONSUMED' } });
            await tx.rawLotStage.create({ data: { rawLotId: input.rawLotId, stage: 'CONSUMED', actorId: user.id, notes: 'Habis dipakai produksi' } });
          }
        }
      });

      const updated = await prisma.productionOrder.findUnique({ where: { id }, include: { product: true, finishedLots: true } });
      return Response.json({ success: true, data: updated, message: 'Production Order COMPLETED, Finished Goods Lot dibuat' });
    }
  }

  const updated = await prisma.productionOrder.update({ where: { id }, data: updateData, include: { product: true } });
  return Response.json({ success: true, data: updated, message: 'Production Order diupdate' });
}
