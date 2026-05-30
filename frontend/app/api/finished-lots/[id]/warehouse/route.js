import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'OPERATOR', 'MANAGER')) return forbidden();

  const { id } = await params;
  const { warehouseZone, warehousePosition } = await request.json();

  if (!warehouseZone || !warehousePosition) {
    return Response.json({ success: false, data: null, message: 'warehouseZone dan warehousePosition wajib diisi' }, { status: 400 });
  }

  const lot = await prisma.finishedGoodsLot.findUnique({ where: { id } });
  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  const moveToWarehouse = ['PRODUCED', 'QC_APPROVED'].includes(lot.currentStatus);

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.finishedGoodsLot.update({
      where: { id },
      data: { warehouseZone, warehousePosition, ...(moveToWarehouse ? { currentStatus: 'IN_WAREHOUSE' } : {}) },
    });
    if (moveToWarehouse) {
      await tx.finishedLotStage.create({ data: { finishedLotId: id, stage: 'IN_WAREHOUSE', actorId: user.id, notes: `Disimpan di ${warehouseZone} / ${warehousePosition}` } });
    }
    return u;
  });

  return Response.json({ success: true, data: updated, message: moveToWarehouse ? 'Status → IN_WAREHOUSE' : 'Posisi gudang diupdate' });
}
