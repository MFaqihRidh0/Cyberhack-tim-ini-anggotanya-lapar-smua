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

    const materials = await prisma.material.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: materials, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, code, category, unit, shelfLifeDays, storageNote } = req.body;

    if (!name || !code || !category || !unit) {
      return res.status(400).json({ success: false, data: null, message: 'name, code, category, dan unit wajib diisi' });
    }

    const existing = await prisma.material.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ success: false, data: null, message: `Kode material '${code}' sudah digunakan` });
    }

    const material = await prisma.material.create({
      data: { name, code, category, unit, shelfLifeDays: shelfLifeDays ? parseInt(shelfLifeDays) : null, storageNote },
    });

    res.status(201).json({ success: true, data: material, message: 'Material berhasil dibuat' });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const material = await prisma.material.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { rawLots: true } } },
    });

    if (!material) {
      return res.status(404).json({ success: false, data: null, message: 'Material tidak ditemukan' });
    }

    res.json({ success: true, data: material, message: 'Berhasil' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, category, unit, shelfLifeDays, storageNote, isActive } = req.body;

    const existing = await prisma.material.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, data: null, message: 'Material tidak ditemukan' });
    }

    const material = await prisma.material.update({
      where: { id: req.params.id },
      data: {
        name,
        category,
        unit,
        shelfLifeDays: shelfLifeDays !== undefined ? parseInt(shelfLifeDays) : undefined,
        storageNote,
        isActive,
      },
    });

    res.json({ success: true, data: material, message: 'Material berhasil diupdate' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, update };
