const prisma = require('../utils/prisma');
const { generateLotNumber } = require('../utils/lotNumber');

// Transisi status PO yang valid
const VALID_PO_TRANSITIONS = {
  QUEUED: ['SCHEDULED', 'IN_PROGRESS', 'CANCELLED'],
  SCHEDULED: ['IN_PROGRESS', 'QUEUED', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

async function list(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const orders = await prisma.productionOrder.findMany({
      where,
      include: {
        product: true,
        createdBy: { select: { id: true, name: true, role: true } },
        _count: { select: { inputs: true, finishedLots: true } },
      },
      orderBy: [{ priority: 'desc' }, { scheduledDate: 'asc' }],
    });

    res.json({ success: true, data: orders, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { productId, targetQty, scheduledDate, priority, notes } = req.body;

    if (!productId || targetQty === undefined || targetQty === null) {
      return res.status(400).json({ success: false, data: null, message: 'productId dan targetQty wajib diisi' });
    }
    if (Number(targetQty) <= 0) {
      return res.status(400).json({ success: false, data: null, message: 'targetQty harus lebih dari 0' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(400).json({ success: false, data: null, message: 'Produk tidak ditemukan' });
    }

    const orderNumber = await generateLotNumber('PO');

    const order = await prisma.productionOrder.create({
      data: {
        orderNumber,
        productId,
        targetQty: Number(targetQty),
        priority: priority !== undefined ? parseInt(priority) : 0,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        notes,
        status: 'QUEUED',
        createdById: req.user.id,
      },
      include: { product: true },
    });

    res.status(201).json({ success: true, data: order, message: 'Production Order berhasil dibuat' });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const order = await prisma.productionOrder.findUnique({
      where: { id: req.params.id },
      include: {
        product: true,
        createdBy: { select: { id: true, name: true, role: true } },
        inputs: {
          include: {
            rawLot: { select: { id: true, internalLotNo: true, currentStatus: true, initialQty: true } },
            material: true,
          },
        },
        finishedLots: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, data: null, message: 'Production Order tidak ditemukan' });
    }

    res.json({ success: true, data: order, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { status, scheduledDate, priority, actualQty, notes } = req.body;

    const order = await prisma.productionOrder.findUnique({
      where: { id: req.params.id },
      include: { product: true, inputs: true },
    });
    if (!order) {
      return res.status(404).json({ success: false, data: null, message: 'Production Order tidak ditemukan' });
    }

    // Validasi transisi status jika status berubah
    if (status && status !== order.status) {
      const allowed = VALID_PO_TRANSITIONS[order.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: `Transisi dari ${order.status} ke ${status} tidak diperbolehkan`,
        });
      }
    }

    // ===== LOGIKA KRITIS: status berubah ke COMPLETED =====
    if (status === 'COMPLETED' && order.status !== 'COMPLETED') {
      const finalQty = actualQty !== undefined && actualQty !== null ? Number(actualQty) : order.actualQty;
      if (finalQty === undefined || finalQty === null) {
        return res.status(400).json({ success: false, data: null, message: 'actualQty wajib diisi saat menyelesaikan produksi' });
      }
      if (finalQty <= 0) {
        return res.status(400).json({ success: false, data: null, message: 'actualQty harus lebih dari 0' });
      }

      const lotNumber = await generateLotNumber('SA-FG');

      // Hitung expiry dari shelfLifeDays produk (jika ada)
      let expiryDate = null;
      const now = new Date();
      if (order.product.shelfLifeDays) {
        expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + order.product.shelfLifeDays);
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1 & 6. Update PO → COMPLETED + actualQty + completedAt
        const updatedPO = await tx.productionOrder.update({
          where: { id: order.id },
          data: {
            status: 'COMPLETED',
            actualQty: finalQty,
            completedAt: now,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            priority: priority !== undefined ? parseInt(priority) : undefined,
            notes: notes !== undefined ? notes : undefined,
          },
        });

        // 2. Auto-create FinishedGoodsLot
        const finishedLot = await tx.finishedGoodsLot.create({
          data: {
            lotNumber,
            productId: order.productId,
            productionOrderId: order.id,
            quantity: finalQty,
            unit: order.product.unit,
            currentStatus: 'PRODUCED',
            producedAt: now,
            expiryDate,
          },
        });

        // 3. Auto-create FinishedLotStage (PRODUCED)
        await tx.finishedLotStage.create({
          data: {
            finishedLotId: finishedLot.id,
            stage: 'PRODUCED',
            actorId: req.user.id,
            notes: `Produksi selesai dari ${order.orderNumber}`,
          },
        });

        // 4. Update RawMaterialLot yang dipakai → CONSUMED jika remainingQty <= 0
        const rawLotIds = [...new Set(order.inputs.map((i) => i.rawLotId))];
        for (const rawLotId of rawLotIds) {
          const lot = await tx.rawMaterialLot.findUnique({
            where: { id: rawLotId },
            include: { productionInputs: true },
          });
          const used = lot.productionInputs.reduce((s, i) => s + i.qtyUsed, 0);
          const remaining = lot.initialQty - used;
          if (remaining <= 0 && lot.currentStatus !== 'CONSUMED') {
            await tx.rawMaterialLot.update({
              where: { id: rawLotId },
              data: { currentStatus: 'CONSUMED' },
            });
            await tx.rawLotStage.create({
              data: {
                rawLotId,
                stage: 'CONSUMED',
                actorId: req.user.id,
                notes: `Habis dipakai pada ${order.orderNumber}`,
              },
            });
          }
        }

        return { updatedPO, finishedLot };
      });

      return res.json({
        success: true,
        data: result.updatedPO,
        message: `Produksi selesai. FinishedGoodsLot ${result.finishedLot.lotNumber} otomatis dibuat`,
      });
    }

    // ===== Update biasa (non-COMPLETED) =====
    const data = {};
    if (status !== undefined) data.status = status;
    if (scheduledDate !== undefined) data.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    if (priority !== undefined) data.priority = parseInt(priority);
    if (actualQty !== undefined) data.actualQty = Number(actualQty);
    if (notes !== undefined) data.notes = notes;

    // Set startedAt saat masuk IN_PROGRESS
    if (status === 'IN_PROGRESS' && !order.startedAt) {
      data.startedAt = new Date();
    }

    const updated = await prisma.productionOrder.update({
      where: { id: order.id },
      data,
      include: { product: true },
    });

    res.json({ success: true, data: updated, message: 'Production Order berhasil diupdate' });
  } catch (err) {
    next(err);
  }
}

async function addInput(req, res, next) {
  try {
    const { rawLotId, materialId, qtyUsed } = req.body;

    if (!rawLotId || !materialId || qtyUsed === undefined || qtyUsed === null) {
      return res.status(400).json({ success: false, data: null, message: 'rawLotId, materialId, dan qtyUsed wajib diisi' });
    }
    if (Number(qtyUsed) <= 0) {
      return res.status(400).json({ success: false, data: null, message: 'qtyUsed harus lebih dari 0' });
    }

    const order = await prisma.productionOrder.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ success: false, data: null, message: 'Production Order tidak ditemukan' });
    }
    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ success: false, data: null, message: `Tidak bisa menambah bahan baku ke PO berstatus ${order.status}` });
    }

    const lot = await prisma.rawMaterialLot.findUnique({
      where: { id: rawLotId },
      include: { productionInputs: true },
    });
    if (!lot) {
      return res.status(404).json({ success: false, data: null, message: 'Raw Material Lot tidak ditemukan' });
    }

    // Validasi: status lot harus QC_APPROVED atau IN_QUEUE (atau sudah IN_PRODUCTION)
    if (!['QC_APPROVED', 'IN_QUEUE', 'IN_PRODUCTION'].includes(lot.currentStatus)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Lot berstatus ${lot.currentStatus} tidak bisa dipakai produksi (harus QC_APPROVED atau IN_QUEUE)`,
      });
    }

    // Validasi: qtyUsed <= remainingQty
    const used = lot.productionInputs.reduce((s, i) => s + i.qtyUsed, 0);
    const remaining = lot.initialQty - used;
    if (Number(qtyUsed) > remaining) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `qtyUsed (${qtyUsed}) melebihi sisa lot (${remaining})`,
      });
    }

    const input = await prisma.$transaction(async (tx) => {
      const newInput = await tx.productionInput.create({
        data: {
          productionOrderId: order.id,
          rawLotId,
          materialId,
          qtyUsed: Number(qtyUsed),
        },
        include: {
          rawLot: { select: { id: true, internalLotNo: true } },
          material: true,
        },
      });

      // Update status lot → IN_PRODUCTION jika belum
      if (lot.currentStatus !== 'IN_PRODUCTION') {
        await tx.rawMaterialLot.update({
          where: { id: rawLotId },
          data: { currentStatus: 'IN_PRODUCTION' },
        });
        await tx.rawLotStage.create({
          data: {
            rawLotId,
            stage: 'IN_PRODUCTION',
            actorId: req.user.id,
            notes: `Dipakai pada ${order.orderNumber}`,
          },
        });
      }

      return newInput;
    });

    res.status(201).json({ success: true, data: input, message: 'Bahan baku berhasil ditambahkan' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, update, addInput };
