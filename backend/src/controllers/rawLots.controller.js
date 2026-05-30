const prisma = require('../utils/prisma');
const { generateLotNumber } = require('../utils/lotNumber');
const QRCode = require('qrcode');

// Transisi status yang valid (state machine)
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

// Role yang boleh menetapkan status tujuan tertentu (sesuai RBAC CONTEXT.md)
const STATUS_ROLE = {
  QC_PENDING: ['OPERATOR', 'MANAGER'],
  QC_APPROVED: ['QC_STAFF', 'MANAGER'],
  QC_REJECTED: ['QC_STAFF', 'MANAGER'],
  IN_QUEUE: ['PPIC', 'MANAGER'],
  IN_PRODUCTION: ['PPIC', 'MANAGER'],
  CONSUMED: ['PPIC', 'MANAGER'],
  ON_HOLD: ['QC_STAFF', 'PPIC', 'MANAGER'],
};

function computeRemaining(lot) {
  const used = (lot.productionInputs || []).reduce((sum, i) => sum + i.qtyUsed, 0);
  return lot.initialQty - used;
}

async function list(req, res, next) {
  try {
    const { status, materialId, supplierId, search } = req.query;
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
      include: {
        material: true,
        supplier: true,
        _count: { select: { stages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: lots, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const {
      deliveryOrderId,
      supplierId,
      materialId,
      initialQty,
      supplierLotNo,
      manufacturedDate,
      expiryDate,
      notes,
    } = req.body;

    if (!supplierId || !materialId || initialQty === undefined || initialQty === null) {
      return res.status(400).json({ success: false, data: null, message: 'supplierId, materialId, dan initialQty wajib diisi' });
    }
    if (Number(initialQty) <= 0) {
      return res.status(400).json({ success: false, data: null, message: 'initialQty harus lebih dari 0' });
    }

    const [supplier, material] = await Promise.all([
      prisma.supplier.findUnique({ where: { id: supplierId } }),
      prisma.material.findUnique({ where: { id: materialId } }),
    ]);
    if (!supplier) return res.status(400).json({ success: false, data: null, message: 'Supplier tidak ditemukan' });
    if (!material) return res.status(400).json({ success: false, data: null, message: 'Material tidak ditemukan' });

    if (deliveryOrderId) {
      const doExists = await prisma.deliveryOrder.findUnique({ where: { id: deliveryOrderId } });
      if (!doExists) return res.status(400).json({ success: false, data: null, message: 'Delivery Order tidak ditemukan' });
    }

    const internalLotNo = await generateLotNumber('SA-RM');

    const lot = await prisma.$transaction(async (tx) => {
      const newLot = await tx.rawMaterialLot.create({
        data: {
          internalLotNo,
          supplierLotNo,
          initialQty: Number(initialQty),
          currentStatus: 'INCOMING',
          deliveryOrderId: deliveryOrderId || null,
          supplierId,
          materialId,
          createdById: req.user.id,
          manufacturedDate: manufacturedDate ? new Date(manufacturedDate) : null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          notes,
        },
      });

      await tx.rawLotStage.create({
        data: {
          rawLotId: newLot.id,
          stage: 'INCOMING',
          actorId: req.user.id,
          notes: 'Lot diterima',
        },
      });

      return newLot;
    });

    const full = await prisma.rawMaterialLot.findUnique({
      where: { id: lot.id },
      include: { material: true, supplier: true },
    });

    res.status(201).json({ success: true, data: full, message: 'Raw Material Lot berhasil dibuat' });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const lot = await prisma.rawMaterialLot.findUnique({
      where: { id: req.params.id },
      include: {
        material: true,
        supplier: true,
        deliveryOrder: true,
        stages: {
          include: { actor: { select: { id: true, name: true, role: true } } },
          orderBy: { timestamp: 'asc' },
        },
        qcInspections: {
          include: { inspectedBy: { select: { id: true, name: true, role: true } } },
          orderBy: { inspectedAt: 'desc' },
        },
        productionInputs: {
          include: { productionOrder: { select: { id: true, orderNumber: true, status: true } } },
        },
      },
    });

    if (!lot) {
      return res.status(404).json({ success: false, data: null, message: 'Raw Material Lot tidak ditemukan' });
    }

    const data = { ...lot, remainingQty: computeRemaining(lot) };
    res.json({ success: true, data, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function getRemaining(req, res, next) {
  try {
    const lot = await prisma.rawMaterialLot.findUnique({
      where: { id: req.params.id },
      include: { productionInputs: true },
    });

    if (!lot) {
      return res.status(404).json({ success: false, data: null, message: 'Raw Material Lot tidak ditemukan' });
    }

    const remainingQty = computeRemaining(lot);
    res.json({
      success: true,
      data: { id: lot.id, internalLotNo: lot.internalLotNo, initialQty: lot.initialQty, remainingQty },
      message: 'Berhasil',
    });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, data: null, message: 'status wajib diisi' });
    }

    const validStatuses = Object.keys(VALID_TRANSITIONS);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, data: null, message: `Status '${status}' tidak valid` });
    }

    const lot = await prisma.rawMaterialLot.findUnique({ where: { id: req.params.id } });
    if (!lot) {
      return res.status(404).json({ success: false, data: null, message: 'Raw Material Lot tidak ditemukan' });
    }

    // Validasi transisi status
    const allowed = VALID_TRANSITIONS[lot.currentStatus] || [];
    if (lot.currentStatus === status) {
      return res.status(400).json({ success: false, data: null, message: `Lot sudah berstatus ${status}` });
    }
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Transisi dari ${lot.currentStatus} ke ${status} tidak diperbolehkan`,
      });
    }

    // Validasi role yang boleh set status tujuan
    const allowedRoles = STATUS_ROLE[status] || [];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `Role ${req.user.role} tidak diizinkan mengubah status ke ${status}`,
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.rawMaterialLot.update({
        where: { id: lot.id },
        data: { currentStatus: status },
      });
      await tx.rawLotStage.create({
        data: { rawLotId: lot.id, stage: status, actorId: req.user.id, notes },
      });
      return u;
    });

    res.json({ success: true, data: updated, message: `Status lot diubah ke ${status}` });
  } catch (err) {
    next(err);
  }
}

async function generateQR(req, res, next) {
  try {
    const lot = await prisma.rawMaterialLot.findUnique({
      where: { id: req.params.id },
      include: { material: { select: { name: true } } },
    });

    if (!lot) {
      return res.status(404).json({ success: false, data: null, message: 'Raw Material Lot tidak ditemukan' });
    }

    const qrData = JSON.stringify({
      type: 'RAW_LOT',
      id: lot.id,
      lotNumber: lot.internalLotNo,
      material: lot.material.name,
      status: lot.currentStatus,
    });

    const buffer = await QRCode.toBuffer(qrData, { type: 'png', width: 300, margin: 2 });
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, getRemaining, updateStatus, generateQR };
