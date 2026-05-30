import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized } from '@/lib/server/auth';

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const lot = await prisma.rawMaterialLot.findUnique({
    where: { id },
    include: {
      material: true, supplier: true, deliveryOrder: true,
      stages: { include: { actor: { select: { id: true, name: true, role: true } } }, orderBy: { timestamp: 'asc' } },
      qcInspections: { include: { inspectedBy: { select: { id: true, name: true, role: true } } }, orderBy: { inspectedAt: 'desc' } },
      productionInputs: { include: { productionOrder: { select: { id: true, orderNumber: true, status: true } } } },
    },
  });

  if (!lot) return Response.json({ success: false, data: null, message: 'Raw Material Lot tidak ditemukan' }, { status: 404 });

  const used = (lot.productionInputs || []).reduce((sum, i) => sum + i.qtyUsed, 0);
  const data = { ...lot, remainingQty: lot.initialQty - used };
  return Response.json({ success: true, data, message: 'Berhasil' });
}
