import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const [rawLotCounts, poCounts, fgCounts, rawStages, finishedStages] = await Promise.all([
    prisma.rawMaterialLot.groupBy({ by: ['currentStatus'], _count: { id: true } }),
    prisma.productionOrder.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.finishedGoodsLot.groupBy({ by: ['currentStatus'], _count: { id: true } }),
    prisma.rawLotStage.findMany({ take: 10, orderBy: { timestamp: 'desc' }, include: { actor: { select: { name: true } }, rawLot: { select: { internalLotNo: true } } } }),
    prisma.finishedLotStage.findMany({ take: 10, orderBy: { timestamp: 'desc' }, include: { actor: { select: { name: true } }, finishedLot: { select: { lotNumber: true } } } }),
  ]);

  const rawLots = { total: 0, incoming: 0, qcPending: 0, qcApproved: 0, inProduction: 0, rejected: 0 };
  for (const r of rawLotCounts) {
    rawLots.total += r._count.id;
    if (r.currentStatus === 'INCOMING') rawLots.incoming = r._count.id;
    if (r.currentStatus === 'QC_PENDING') rawLots.qcPending = r._count.id;
    if (r.currentStatus === 'QC_APPROVED') rawLots.qcApproved = r._count.id;
    if (r.currentStatus === 'IN_PRODUCTION') rawLots.inProduction = r._count.id;
    if (r.currentStatus === 'QC_REJECTED') rawLots.rejected = r._count.id;
  }

  const productionOrders = { total: 0, queued: 0, scheduled: 0, inProgress: 0, completed: 0 };
  for (const r of poCounts) {
    productionOrders.total += r._count.id;
    if (r.status === 'QUEUED') productionOrders.queued = r._count.id;
    if (r.status === 'SCHEDULED') productionOrders.scheduled = r._count.id;
    if (r.status === 'IN_PROGRESS') productionOrders.inProgress = r._count.id;
    if (r.status === 'COMPLETED') productionOrders.completed = r._count.id;
  }

  const finishedGoods = { total: 0, inWarehouse: 0, dispatched: 0 };
  for (const r of fgCounts) {
    finishedGoods.total += r._count.id;
    if (r.currentStatus === 'IN_WAREHOUSE') finishedGoods.inWarehouse = r._count.id;
    if (['PARTIALLY_DISPATCHED', 'FULLY_DISPATCHED'].includes(r.currentStatus)) finishedGoods.dispatched += r._count.id;
  }

  const recentActivity = [
    ...rawStages.map((s) => ({ type: 'RAW_LOT', lotNumber: s.rawLot.internalLotNo, stage: s.stage, actor: s.actor.name, timestamp: s.timestamp })),
    ...finishedStages.map((s) => ({ type: 'FINISHED_LOT', lotNumber: s.finishedLot.lotNumber, stage: s.stage, actor: s.actor.name, timestamp: s.timestamp })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

  return Response.json({ success: true, data: { rawLots, productionOrders, finishedGoods, recentActivity }, message: 'Berhasil' });
}
