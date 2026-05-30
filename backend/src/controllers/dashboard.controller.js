const prisma = require('../utils/prisma');

async function summary(req, res, next) {
  try {
    // Raw Lots breakdown
    const rawLotCounts = await prisma.rawMaterialLot.groupBy({
      by: ['currentStatus'],
      _count: { id: true },
    });

    const rawLots = {
      total: 0,
      incoming: 0,
      qcPending: 0,
      qcApproved: 0,
      inProduction: 0,
      rejected: 0,
    };

    for (const row of rawLotCounts) {
      rawLots.total += row._count.id;
      switch (row.currentStatus) {
        case 'INCOMING': rawLots.incoming = row._count.id; break;
        case 'QC_PENDING': rawLots.qcPending = row._count.id; break;
        case 'QC_APPROVED': rawLots.qcApproved = row._count.id; break;
        case 'IN_PRODUCTION': rawLots.inProduction = row._count.id; break;
        case 'QC_REJECTED': rawLots.rejected = row._count.id; break;
      }
    }

    // Production Orders breakdown
    const poCounts = await prisma.productionOrder.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const productionOrders = {
      total: 0,
      queued: 0,
      scheduled: 0,
      inProgress: 0,
      completed: 0,
    };

    for (const row of poCounts) {
      productionOrders.total += row._count.id;
      switch (row.status) {
        case 'QUEUED': productionOrders.queued = row._count.id; break;
        case 'SCHEDULED': productionOrders.scheduled = row._count.id; break;
        case 'IN_PROGRESS': productionOrders.inProgress = row._count.id; break;
        case 'COMPLETED': productionOrders.completed = row._count.id; break;
      }
    }

    // Finished Goods breakdown
    const fgCounts = await prisma.finishedGoodsLot.groupBy({
      by: ['currentStatus'],
      _count: { id: true },
    });

    const finishedGoods = {
      total: 0,
      inWarehouse: 0,
      dispatched: 0,
    };

    for (const row of fgCounts) {
      finishedGoods.total += row._count.id;
      switch (row.currentStatus) {
        case 'IN_WAREHOUSE': finishedGoods.inWarehouse = row._count.id; break;
        case 'PARTIALLY_DISPATCHED':
        case 'FULLY_DISPATCHED':
          finishedGoods.dispatched += row._count.id; break;
      }
    }

    // Recent Activity — 10 terbaru dari RawLotStage + FinishedLotStage
    const [rawStages, finishedStages] = await Promise.all([
      prisma.rawLotStage.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          actor: { select: { id: true, name: true } },
          rawLot: { select: { internalLotNo: true } },
        },
      }),
      prisma.finishedLotStage.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          actor: { select: { id: true, name: true } },
          finishedLot: { select: { lotNumber: true } },
        },
      }),
    ]);

    const recentActivity = [
      ...rawStages.map((s) => ({
        type: 'RAW_LOT',
        lotNumber: s.rawLot.internalLotNo,
        stage: s.stage,
        actor: s.actor.name,
        timestamp: s.timestamp,
      })),
      ...finishedStages.map((s) => ({
        type: 'FINISHED_LOT',
        lotNumber: s.finishedLot.lotNumber,
        stage: s.stage,
        actor: s.actor.name,
        timestamp: s.timestamp,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json({
      success: true,
      data: { rawLots, productionOrders, finishedGoods, recentActivity },
      message: 'Berhasil',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { summary };
