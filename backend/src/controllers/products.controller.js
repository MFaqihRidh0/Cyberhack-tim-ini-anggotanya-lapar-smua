const prisma = require('../utils/prisma');

async function list(req, res, next) {
  try {
    const { isActive, category, search } = req.query;
    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      where.isActive = true;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: products, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, code, category, unit, shelfLifeDays } = req.body;

    if (!name || !code || !category || !unit) {
      return res.status(400).json({ success: false, data: null, message: 'name, code, category, dan unit wajib diisi' });
    }

    const existing = await prisma.product.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ success: false, data: null, message: `Kode produk '${code}' sudah digunakan` });
    }

    const product = await prisma.product.create({
      data: { name, code, category, unit, shelfLifeDays: shelfLifeDays ? parseInt(shelfLifeDays) : null },
    });

    res.status(201).json({ success: true, data: product, message: 'Produk berhasil dibuat' });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { finishedLots: true, productionOrders: true } } },
    });

    if (!product) {
      return res.status(404).json({ success: false, data: null, message: 'Produk tidak ditemukan' });
    }

    res.json({ success: true, data: product, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, category, unit, shelfLifeDays, isActive } = req.body;

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, data: null, message: 'Produk tidak ditemukan' });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        category,
        unit,
        shelfLifeDays: shelfLifeDays !== undefined ? parseInt(shelfLifeDays) : undefined,
        isActive,
      },
    });

    res.json({ success: true, data: product, message: 'Produk berhasil diupdate' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, update };
