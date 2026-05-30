const prisma = require('../utils/prisma');

async function list(req, res, next) {
  try {
    const { isActive, search } = req.query;
    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: suppliers, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, code, contactName, phone, email, address } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, data: null, message: 'name dan code wajib diisi' });
    }

    const existing = await prisma.supplier.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ success: false, data: null, message: `Kode supplier '${code}' sudah digunakan` });
    }

    const supplier = await prisma.supplier.create({
      data: { name, code, contactName, phone, email, address },
    });

    res.status(201).json({ success: true, data: supplier, message: 'Supplier berhasil dibuat' });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { rawLots: true, deliveryOrders: true } } },
    });

    if (!supplier) {
      return res.status(404).json({ success: false, data: null, message: 'Supplier tidak ditemukan' });
    }

    res.json({ success: true, data: supplier, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, contactName, phone, email, address, isActive } = req.body;

    const existing = await prisma.supplier.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, data: null, message: 'Supplier tidak ditemukan' });
    }

    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: { name, contactName, phone, email, address, isActive },
    });

    res.json({ success: true, data: supplier, message: 'Supplier berhasil diupdate' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, update };
