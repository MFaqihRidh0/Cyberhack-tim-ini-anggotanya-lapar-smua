const prisma = require('../utils/prisma');

async function list(req, res, next) {
  try {
    const { status, productId } = req.query;
    const where = {};
    if (status) where.currentStatus = status;
    if (productId) where.productId = productId;

    const lots = await prisma.finishedGoodsLot.findMany({
      where,
      include: {
        product: true,
        productionOrder: { select: { id: true, orderNumber: true } },
        _count: { select: { sampleDispatches: true } },
      },
      orderBy: { producedAt: 'desc' },
    });

    res.json({ success: true, data: lots, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const lot = await prisma.finishedGoodsLot.findUnique({
      where: { id: req.params.id },
      include: {
        product: true,
        productionOrder: {
          include: {
            inputs: {
              include: {
                rawLot: { select: { id: true, internalLotNo: true, currentStatus: true } },
                material: true,
              },
            },
          },
        },
        stages: {
          include: { actor: { select: { id: true, name: true, role: true } } },
          orderBy: { timestamp: 'asc' },
        },
        qcInspections: {
          include: { inspectedBy: { select: { id: true, name: true, role: true } } },
          orderBy: { inspectedAt: 'desc' },
        },
        sampleDispatches: {
          include: { dispatchedBy: { select: { id: true, name: true, role: true } } },
          orderBy: { dispatchDate: 'desc' },
        },
      },
    });

    if (!lot) {
      return res.status(404).json({ success: false, data: null, message: 'Finished Goods Lot tidak ditemukan' });
    }

    res.json({ success: true, data: lot, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function updateWarehouse(req, res, next) {
  try {
    const { warehouseZone, warehousePosition } = req.body;

    if (!warehouseZone || !warehousePosition) {
      return res.status(400).json({ success: false, data: null, message: 'warehouseZone dan warehousePosition wajib diisi' });
    }

    const lot = await prisma.finishedGoodsLot.findUnique({ where: { id: req.params.id } });
    if (!lot) {
      return res.status(404).json({ success: false, data: null, message: 'Finished Goods Lot tidak ditemukan' });
    }

    const moveToWarehouse = ['PRODUCED', 'QC_APPROVED'].includes(lot.currentStatus);

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.finishedGoodsLot.update({
        where: { id: lot.id },
        data: {
          warehouseZone,
          warehousePosition,
          ...(moveToWarehouse ? { currentStatus: 'IN_WAREHOUSE' } : {}),
        },
      });

      if (moveToWarehouse) {
        await tx.finishedLotStage.create({
          data: {
            finishedLotId: lot.id,
            stage: 'IN_WAREHOUSE',
            actorId: req.user.id,
            notes: `Disimpan di ${warehouseZone} / ${warehousePosition}`,
          },
        });
      }

      return u;
    });

    res.json({
      success: true,
      data: updated,
      message: moveToWarehouse ? 'Posisi gudang diset, status → IN_WAREHOUSE' : 'Posisi gudang diupdate',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, updateWarehouse };
