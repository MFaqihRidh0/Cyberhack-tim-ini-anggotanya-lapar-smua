import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden } from '@/lib/server/auth';

const VALID_TRANSITIONS = {
  INCOMING: ['QC_PENDING', 'ON_HOLD'],
  QC_PENDING: ['QC_APPROVED', 'QC_REJECTED', 'ON_HOLD'],
  QC_APPROVED: ['IN_QUEUE', 'IN_PRODUCTION', 'ON_HOLD'],
  QC_REJECTED: ['ON_HOLD'],
  IN_QUEUE: ['IN_PRODUCTION', 'ON_HOLD'],
  IN_PRODUCTION: ['CONSUMED', 'ON_HOLD'],
  ON_HOLD: ['QC_PENDING', 'QC_APPROVED', 'IN_QUEUE', 'IN_PRODUCTION'],
  CONSUMED: [],
};

const STATUS_ROLE = {
  QC_PENDING: ['OPERATOR', 'MANAGER'],
  QC_APPROVED: ['QC_STAFF', 'MANAGER'],
  QC_REJECTED: ['QC_STAFF', 'MANAGER'],
  IN_QUEUE: ['PPIC', 'MANAGER'],
  IN_PRODUCTION: ['PPIC', 'MANAGER'],
  CONSUMED: ['PPIC', 'MANAGER'],
  ON_HOLD: ['QC_STAFF', 'PPIC', 'MANAGER'],
};

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { status, notes } = await request.json();

  if (!status) return Response.json({ success: false, data: null, message: 'status wajib diisi' }, { status: 400 });

  const lot = await prisma.rawMaterialLot.findUnique({ where: { id } });
  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  const allowed = VALID_TRANSITIONS[lot.currentStatus] || [];
  if (!allowed.includes(status)) {
    return Response.json({ success: false, data: null, message: `Transisi dari ${lot.currentStatus} ke ${status} tidak diperbolehkan` }, { status: 400 });
  }

  const allowedRoles = STATUS_ROLE[status] || [];
  if (!allowedRoles.includes(user.role)) {
    return forbidden(`Role ${user.role} tidak diizinkan mengubah status ke ${status}`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.rawMaterialLot.update({ where: { id }, data: { currentStatus: status } });
    await tx.rawLotStage.create({ data: { rawLotId: id, stage: status, actorId: user.id, notes } });
    return u;
  });

  return Response.json({ success: true, data: updated, message: `Status lot diubah ke ${status}` });
}
