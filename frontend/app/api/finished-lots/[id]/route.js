import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized } from '@/lib/server/auth';

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const lot = await prisma.finishedGoodsLot.findUnique({
    where: { id },
    include: {
      product: true,
      productionOrder: { include: { inputs: { include: { rawLot: { select: { id: true, internalLotNo: true } }, material: true } } } },
      stages: { include: { actor: { select: { id: true, name: true, role: true } } }, orderBy: { timestamp: 'asc' } },
      qcInspections: { include: { inspectedBy: { select: { id: true, name: true } } }, orderBy: { inspectedAt: 'desc' } },
      sampleDispatches: { include: { dispatchedBy: { select: { id: true, name: true } } }, orderBy: { dispatchDate: 'desc' } },
    },
  });

  if (!lot) return Response.json({ success: false, data: null, message: 'Finished Goods Lot tidak ditemukan' }, { status: 404 });
  return Response.json({ success: true, data: lot, message: 'Berhasil' });
}
