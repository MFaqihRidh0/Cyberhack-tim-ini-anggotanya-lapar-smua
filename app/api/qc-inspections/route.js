import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const inspections = await prisma.qCInspection.findMany({
    include: {
      rawLot: { select: { id: true, internalLotNo: true, material: { select: { name: true } } } },
      finishedLot: { select: { id: true, lotNumber: true, product: { select: { name: true } } } },
      inspectedBy: { select: { id: true, name: true } },
    },
    orderBy: { inspectedAt: 'desc' },
  });
  return Response.json({ success: true, data: inspections, message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'QC_STAFF', 'MANAGER')) return forbidden();

  const body = await request.json();
  const { rawLotId, finishedLotId, result, colorScore, odorScore, textureScore, moistureLevel, notes } = body;

  if (!result) return Response.json({ success: false, data: null, message: 'result wajib diisi' }, { status: 400 });
  if (!rawLotId && !finishedLotId) return Response.json({ success: false, data: null, message: 'rawLotId atau finishedLotId wajib diisi' }, { status: 400 });
  if (rawLotId && finishedLotId) return Response.json({ success: false, data: null, message: 'Hanya salah satu: rawLotId ATAU finishedLotId' }, { status: 400 });

  const statusMap = { APPROVED: 'QC_APPROVED', REJECTED: 'QC_REJECTED', ON_HOLD: 'ON_HOLD' };
  const newStatus = statusMap[result];

  const inspection = await prisma.$transaction(async (tx) => {
    const qc = await tx.qCInspection.create({
      data: { rawLotId, finishedLotId, result, colorScore, odorScore, textureScore, moistureLevel, notes, inspectedById: user.id },
    });

    if (rawLotId) {
      await tx.rawMaterialLot.update({ where: { id: rawLotId }, data: { currentStatus: newStatus } });
      await tx.rawLotStage.create({ data: { rawLotId, stage: newStatus, actorId: user.id, notes: `QC: ${result}` } });
    }

    if (finishedLotId) {
      await tx.finishedGoodsLot.update({ where: { id: finishedLotId }, data: { currentStatus: newStatus } });
      await tx.finishedLotStage.create({ data: { finishedLotId, stage: newStatus, actorId: user.id, notes: `QC: ${result}` } });
    }

    return qc;
  });

  return Response.json({ success: true, data: inspection, message: 'QC Inspection berhasil disimpan' }, { status: 201 });
}
