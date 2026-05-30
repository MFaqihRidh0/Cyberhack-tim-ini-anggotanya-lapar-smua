const prisma = require('../utils/prisma');

// Mapping hasil QC → status lot
const QC_TO_RAW_STATUS = {
  APPROVED: 'QC_APPROVED',
  REJECTED: 'QC_REJECTED',
  ON_HOLD: 'ON_HOLD',
};

const QC_TO_FINISHED_STATUS = {
  APPROVED: 'QC_APPROVED',
  REJECTED: 'QC_REJECTED',
  ON_HOLD: 'ON_HOLD',
};

async function list(req, res, next) {
  try {
    const { type, result, pending } = req.query;
    const where = {};

    if (result) where.result = result;

    if (type === 'raw') where.rawLotId = { not: null };
    else if (type === 'finished') where.finishedLotId = { not: null };

    const inspections = await prisma.qCInspection.findMany({
      where,
      include: {
        rawLot: { include: { material: true } },
        finishedLot: { include: { product: true } },
        inspectedBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { inspectedAt: 'desc' },
    });

    res.json({ success: true, data: inspections, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function listPending(req, res, next) {
  try {
    const { type } = req.query;
    const result = {};

    if (!type || type === 'raw') {
      result.rawLots = await prisma.rawMaterialLot.findMany({
        where: { currentStatus: 'QC_PENDING' },
        include: { material: true, supplier: true },
        orderBy: { receivedDate: 'asc' },
      });
    }
    if (!type || type === 'finished') {
      result.finishedLots = await prisma.finishedGoodsLot.findMany({
        where: { currentStatus: 'QC_PENDING' },
        include: { product: true, productionOrder: { select: { orderNumber: true } } },
        orderBy: { producedAt: 'asc' },
      });
    }

    res.json({ success: true, data: result, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const {
      rawLotId,
      finishedLotId,
      result,
      colorScore,
      odorScore,
      textureScore,
      moistureLevel,
      notes,
    } = req.body;

    // Validasi: hanya salah satu yang diisi
    if ((!rawLotId && !finishedLotId) || (rawLotId && finishedLotId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Isi salah satu saja: rawLotId ATAU finishedLotId',
      });
    }

    if (!result || !['APPROVED', 'REJECTED', 'ON_HOLD'].includes(result)) {
      return res.status(400).json({ success: false, data: null, message: 'result harus APPROVED, REJECTED, atau ON_HOLD' });
    }

    const inspectionData = {
      result,
      colorScore: colorScore !== undefined ? parseInt(colorScore) : null,
      odorScore: odorScore !== undefined ? parseInt(odorScore) : null,
      textureScore: textureScore !== undefined ? parseInt(textureScore) : null,
      moistureLevel: moistureLevel !== undefined ? parseFloat(moistureLevel) : null,
      notes,
      inspectedById: req.user.id,
    };

    if (rawLotId) {
      const lot = await prisma.rawMaterialLot.findUnique({ where: { id: rawLotId } });
      if (!lot) {
        return res.status(404).json({ success: false, data: null, message: 'Raw Material Lot tidak ditemukan' });
      }

      const newStatus = QC_TO_RAW_STATUS[result];

      const inspection = await prisma.$transaction(async (tx) => {
        const insp = await tx.qCInspection.create({ data: { ...inspectionData, rawLotId } });
        await tx.rawMaterialLot.update({
          where: { id: rawLotId },
          data: { currentStatus: newStatus },
        });
        await tx.rawLotStage.create({
          data: {
            rawLotId,
            stage: newStatus,
            actorId: req.user.id,
            notes: notes || `Hasil QC: ${result}`,
          },
        });
        return insp;
      });

      return res.status(201).json({
        success: true,
        data: inspection,
        message: `QC selesai. Status lot diubah ke ${newStatus}`,
      });
    }

    // finishedLotId
    const flot = await prisma.finishedGoodsLot.findUnique({ where: { id: finishedLotId } });
    if (!flot) {
      return res.status(404).json({ success: false, data: null, message: 'Finished Goods Lot tidak ditemukan' });
    }

    const newStatus = QC_TO_FINISHED_STATUS[result];

    const inspection = await prisma.$transaction(async (tx) => {
      const insp = await tx.qCInspection.create({ data: { ...inspectionData, finishedLotId } });
      await tx.finishedGoodsLot.update({
        where: { id: finishedLotId },
        data: { currentStatus: newStatus },
      });
      await tx.finishedLotStage.create({
        data: {
          finishedLotId,
          stage: newStatus,
          actorId: req.user.id,
          notes: notes || `Hasil QC: ${result}`,
        },
      });
      return insp;
    });

    res.status(201).json({
      success: true,
      data: inspection,
      message: `QC selesai. Status finished lot diubah ke ${newStatus}`,
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const inspection = await prisma.qCInspection.findUnique({
      where: { id: req.params.id },
      include: {
        rawLot: { include: { material: true } },
        finishedLot: { include: { product: true } },
        inspectedBy: { select: { id: true, name: true, role: true } },
      },
    });

    if (!inspection) {
      return res.status(404).json({ success: false, data: null, message: 'QC Inspection tidak ditemukan' });
    }

    res.json({ success: true, data: inspection, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, listPending, create, getById };
