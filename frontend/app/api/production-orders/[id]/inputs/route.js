import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function POST(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'PPIC', 'MANAGER')) return forbidden();

  const { id } = await params;
  const { rawLotId, materialId, qtyUsed } = await request.json();

  if (!rawLotId || !qtyUsed) {
    return Response.json({ success: false, data: null, message: 'rawLotId dan qtyUsed wajib diisi' }, { status: 400 });
  }

  const rawLot = await prisma.rawMaterialLot.findUnique({ where: { id: rawLotId }, include: { productionInputs: true } });
  if (!rawLot) return Response.json({ success: false, data: null, message: 'Raw Lot tidak ditemukan' }, { status: 404 });

  if (!['QC_APPROVED', 'IN_QUEUE', 'IN_PRODUCTION'].includes(rawLot.currentStatus)) {
    return Response.json({ success: false, data: null, message: `Lot status ${rawLot.currentStatus} tidak bisa dipakai` }, { status: 400 });
  }

  const used = rawLot.productionInputs.reduce((s, i) => s + i.qtyUsed, 0);
  const remaining = rawLot.initialQty - used;
  if (Number(qtyUsed) > remaining) {
    return Response.json({ success: false, data: null, message: `qtyUsed (${qtyUsed}) melebihi remaining (${remaining})` }, { status: 400 });
  }

  const input = await prisma.$transaction(async (tx) => {
    const inp = await tx.productionInput.create({
      data: { productionOrderId: id, rawLotId, materialId: materialId || rawLot.materialId, qtyUsed: Number(qtyUsed) },
    });

    if (rawLot.currentStatus !== 'IN_PRODUCTION') {
      await tx.rawMaterialLot.update({ where: { id: rawLotId }, data: { currentStatus: 'IN_PRODUCTION' } });
      await tx.rawLotStage.create({ data: { rawLotId, stage: 'IN_PRODUCTION', actorId: user.id, notes: 'Dipakai produksi' } });
    }

    return inp;
  });

  return Response.json({ success: true, data: input, message: 'Bahan baku ditambahkan' }, { status: 201 });
}
