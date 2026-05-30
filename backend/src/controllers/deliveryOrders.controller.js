const prisma = require('../utils/prisma');

async function list(req, res, next) {
  try {
    const { supplierId, search } = req.query;
    const where = {};

    if (supplierId) where.supplierId = supplierId;
    if (search) where.doNumber = { contains: search, mode: 'insensitive' };

    const orders = await prisma.deliveryOrder.findMany({
      where,
      include: {
        supplier: true,
        _count: { select: { rawLots: true } },
      },
      orderBy: { receivedDate: 'desc' },
    });

    res.json({ success: true, data: orders, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { doNumber, supplierId, receivedDate, notes } = req.body;

    if (!doNumber || !supplierId) {
      return res.status(400).json({ success: false, data: null, message: 'doNumber dan supplierId wajib diisi' });
    }

    const existing = await prisma.deliveryOrder.findUnique({ where: { doNumber } });
    if (existing) {
      return res.status(400).json({ success: false, data: null, message: `Nomor DO '${doNumber}' sudah digunakan` });
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return res.status(400).json({ success: false, data: null, message: 'Supplier tidak ditemukan' });
    }

    const order = await prisma.deliveryOrder.create({
      data: {
        doNumber,
        supplierId,
        receivedDate: receivedDate ? new Date(receivedDate) : undefined,
        notes,
      },
      include: { supplier: true },
    });

    res.status(201).json({ success: true, data: order, message: 'Delivery Order berhasil dibuat' });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const order = await prisma.deliveryOrder.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: true,
        rawLots: {
          include: { material: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, data: null, message: 'Delivery Order tidak ditemukan' });
    }

    res.json({ success: true, data: order, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById };
