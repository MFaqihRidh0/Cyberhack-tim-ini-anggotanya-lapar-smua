const prisma = require('../utils/prisma');
const { generateLotNumber } = require('../utils/lotNumber');

async function list(req, res, next) {
  try {
    const { destination, confirmed } = req.query;
    const where = {};
    if (destination) where.destination = destination;
    if (confirmed !== undefined) where.receivedConfirmed = confirmed === 'true';

    const dispatches = await prisma.sampleDispatch.findMany({
      where,
      include: {
        finishedLot: { include: { product: true } },
        dispatchedBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { dispatchDate: 'desc' },
    });

    res.json({ success: true, data: dispatches, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const {
      finishedLotId,
      customerName,
      customerEmail,
      customerPhone,
      destination,
      country,
      quantity,
      unit,
      trackingNumber,
      notes,
    } = req.body;

    if (!finishedLotId || !customerName || !destination || quantity === undefined || quantity === null || !unit) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'finishedLotId, customerName, destination, quantity, dan unit wajib diisi',
      });
    }

    if (!['LOCAL', 'EXPORT'].includes(destination)) {
      return res.status(400).json({ success: false, data: null, message: 'destination harus LOCAL atau EXPORT' });
    }

    // Validasi: EXPORT wajib ada country
    if (destination === 'EXPORT' && !country) {
      return res.status(400).json({ success: false, data: null, message: 'country wajib diisi untuk dispatch EXPORT' });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({ success: false, data: null, message: 'quantity harus lebih dari 0' });
    }

    const lot = await prisma.finishedGoodsLot.findUnique({
      where: { id: finishedLotId },
      include: { sampleDispatches: true },
    });
    if (!lot) {
      return res.status(404).json({ success: false, data: null, message: 'Finished Goods Lot tidak ditemukan' });
    }
    if (lot.currentStatus === 'FULLY_DISPATCHED') {
      return res.status(400).json({ success: false, data: null, message: 'Lot sudah habis terkirim (FULLY_DISPATCHED)' });
    }

    // Total terkirim kumulatif (termasuk dispatch ini)
    const alreadyDispatched = lot.sampleDispatches.reduce((s, d) => s + d.quantity, 0);
    const totalAfter = alreadyDispatched + Number(quantity);

    if (totalAfter > lot.quantity) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Total dispatch (${totalAfter}) melebihi quantity lot (${lot.quantity}). Sisa: ${lot.quantity - alreadyDispatched}`,
      });
    }

    const newStatus = totalAfter >= lot.quantity ? 'FULLY_DISPATCHED' : 'PARTIALLY_DISPATCHED';
    const dispatchNumber = await generateLotNumber('SD');

    const dispatch = await prisma.$transaction(async (tx) => {
      const d = await tx.sampleDispatch.create({
        data: {
          dispatchNumber,
          finishedLotId,
          customerName,
          customerEmail,
          customerPhone,
          destination,
          country: destination === 'EXPORT' ? country : country || null,
          quantity: Number(quantity),
          unit,
          trackingNumber,
          notes,
          dispatchedById: req.user.id,
        },
        include: { finishedLot: { include: { product: true } } },
      });

      await tx.finishedGoodsLot.update({
        where: { id: finishedLotId },
        data: { currentStatus: newStatus },
      });

      await tx.finishedLotStage.create({
        data: {
          finishedLotId,
          stage: newStatus,
          actorId: req.user.id,
          notes: `Dikirim ke ${customerName} (${dispatchNumber})`,
        },
      });

      return d;
    });

    res.status(201).json({
      success: true,
      data: dispatch,
      message: `Dispatch berhasil dibuat. Status lot → ${newStatus}`,
    });
  } catch (err) {
    next(err);
  }
}

async function confirm(req, res, next) {
  try {
    const { receivedAt } = req.body;

    const dispatch = await prisma.sampleDispatch.findUnique({ where: { id: req.params.id } });
    if (!dispatch) {
      return res.status(404).json({ success: false, data: null, message: 'Sample Dispatch tidak ditemukan' });
    }

    const updated = await prisma.sampleDispatch.update({
      where: { id: req.params.id },
      data: {
        receivedConfirmed: true,
        receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
      },
    });

    res.json({ success: true, data: updated, message: 'Penerimaan dikonfirmasi' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, confirm };
