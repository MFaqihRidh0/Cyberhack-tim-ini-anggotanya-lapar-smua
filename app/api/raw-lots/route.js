import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { generateLotNumber } from '@/lib/server/lotNumber';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const materialId = searchParams.get('materialId');
  const supplierId = searchParams.get('supplierId');
  const search = searchParams.get('search');

  const where = {};
  if (status) where.currentStatus = status;
  if (materialId) where.materialId = materialId;
  if (supplierId) where.supplierId = supplierId;
  if (search) {
    where.OR = [
      { internalLotNo: { contains: search, mode: 'insensitive' } },
      { supplierLotNo: { contains: search, mode: 'insensitive' } },
    ];
  }

  const lots = await prisma.rawMaterialLot.findMany({
    where,
    include: { material: true, supplier: true, _count: { select: { stages: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ success: true, data: lots, message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'OPERATOR', 'MANAGER')) return forbidden();

  const body = await request.json();
  const { deliveryOrderId, supplierId, materialId, initialQty, supplierLotNo, manufacturedDate, expiryDate, notes } = body;

  if (!supplierId || !materialId || !initialQty) {
    return Response.json({ success: false, data: null, message: 'supplierId, materialId, dan initialQty wajib diisi' }, { status: 400 });
  }

  const internalLotNo = await generateLotNumber('SA-RM');

  const lot = await prisma.$transaction(async (tx) => {
    const newLot = await tx.rawMaterialLot.create({
      data: {
        internalLotNo, supplierLotNo, initialQty: Number(initialQty), currentStatus: 'INCOMING',
        deliveryOrderId: deliveryOrderId || null, supplierId, materialId, createdById: user.id,
        manufacturedDate: manufacturedDate ? new Date(manufacturedDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null, notes,
      },
    });
    await tx.rawLotStage.create({ data: { rawLotId: newLot.id, stage: 'INCOMING', actorId: user.id, notes: 'Lot diterima' } });
    return newLot;
  });

  const full = await prisma.rawMaterialLot.findUnique({ where: { id: lot.id }, include: { material: true, supplier: true } });
  return Response.json({ success: true, data: full, message: 'Raw Material Lot berhasil dibuat' }, { status: 201 });
}
