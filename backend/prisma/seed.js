require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Memulai seed data...');

  // ─── USERS ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('SimaArome@2026', 10);

  const operator = await prisma.user.upsert({
    where: { email: 'operator@sima.com' },
    update: { passwordHash },
    create: { name: 'Operator Gudang', email: 'operator@sima.com', passwordHash, role: 'OPERATOR' },
  });

  const qcStaff = await prisma.user.upsert({
    where: { email: 'qc@sima.com' },
    update: { passwordHash },
    create: { name: 'Staff QC', email: 'qc@sima.com', passwordHash, role: 'QC_STAFF' },
  });

  const ppic = await prisma.user.upsert({
    where: { email: 'ppic@sima.com' },
    update: { passwordHash },
    create: { name: 'PPIC Planner', email: 'ppic@sima.com', passwordHash, role: 'PPIC' },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@sima.com' },
    update: { passwordHash },
    create: { name: 'Manager Produksi', email: 'manager@sima.com', passwordHash, role: 'MANAGER' },
  });

  console.log('✅ Users selesai');

  // ─── SUPPLIERS ────────────────────────────────────────────────────────────
  const sup1 = await prisma.supplier.upsert({
    where: { code: 'SUP-001' },
    update: {},
    create: {
      name: 'PT Rempah Nusantara', code: 'SUP-001',
      contactName: 'Budi Santoso', phone: '081234567890',
      email: 'budi@rempah.co.id', address: 'Jl. Rempah No.1, Surabaya',
    },
  });

  const sup2 = await prisma.supplier.upsert({
    where: { code: 'SUP-002' },
    update: {},
    create: {
      name: 'CV Herbal Indonesia', code: 'SUP-002',
      contactName: 'Siti Rahayu', phone: '082345678901',
      email: 'siti@herbal.id', address: 'Jl. Herbal No.2, Malang',
    },
  });

  const sup3 = await prisma.supplier.upsert({
    where: { code: 'SUP-003' },
    update: {},
    create: {
      name: 'PT Buah Tropis', code: 'SUP-003',
      contactName: 'Ahmad Fauzi', phone: '083456789012',
      email: 'ahmad@buahtropis.com', address: 'Jl. Buah No.3, Banyuwangi',
    },
  });

  const sup4 = await prisma.supplier.upsert({
    where: { code: 'SUP-004' },
    update: {},
    create: {
      name: 'CV Alam Segar', code: 'SUP-004',
      contactName: 'Dewi Lestari', phone: '084567890123',
      email: 'dewi@alamsegar.id', address: 'Jl. Alam No.4, Jember',
    },
  });

  const sup5 = await prisma.supplier.upsert({
    where: { code: 'SUP-005' },
    update: {},
    create: {
      name: 'PT Botanika Prima', code: 'SUP-005',
      contactName: 'Rudi Hartono', phone: '085678901234',
      email: 'rudi@botanika.co.id', address: 'Jl. Botanika No.5, Sidoarjo',
    },
  });

  console.log('✅ Suppliers selesai');

  // ─── MATERIALS ────────────────────────────────────────────────────────────
  const matVnl = await prisma.material.upsert({
    where: { code: 'MAT-VNL' },
    update: {},
    create: { name: 'Vanili Madagascar', code: 'MAT-VNL', category: 'Rempah', unit: 'kg', shelfLifeDays: 365, storageNote: 'Simpan di tempat kering dan gelap' },
  });

  const matJhm = await prisma.material.upsert({
    where: { code: 'MAT-JHM' },
    update: {},
    create: { name: 'Jahe Merah', code: 'MAT-JHM', category: 'Rempah', unit: 'kg', shelfLifeDays: 180, storageNote: 'Hindari paparan langsung sinar matahari' },
  });

  const matPdn = await prisma.material.upsert({
    where: { code: 'MAT-PDN' },
    update: {},
    create: { name: 'Pandan Wangi', code: 'MAT-PDN', category: 'Herbal', unit: 'kg', shelfLifeDays: 90, storageNote: 'Simpan dalam kondisi sejuk' },
  });

  const matKym = await prisma.material.upsert({
    where: { code: 'MAT-KYM' },
    update: {},
    create: { name: 'Kayu Manis', code: 'MAT-KYM', category: 'Rempah', unit: 'kg', shelfLifeDays: 365, storageNote: 'Simpan di tempat kering' },
  });

  const matBgt = await prisma.material.upsert({
    where: { code: 'MAT-BGT' },
    update: {},
    create: { name: 'Bunga Telang', code: 'MAT-BGT', category: 'Herbal', unit: 'kg', shelfLifeDays: 120 },
  });

  const matSri = await prisma.material.upsert({
    where: { code: 'MAT-SRI' },
    update: {},
    create: { name: 'Serai', code: 'MAT-SRI', category: 'Herbal', unit: 'kg', shelfLifeDays: 90 },
  });

  const matLmn = await prisma.material.upsert({
    where: { code: 'MAT-LMN' },
    update: {},
    create: { name: 'Lemon', code: 'MAT-LMN', category: 'Buah', unit: 'kg', shelfLifeDays: 30, storageNote: 'Simpan di kulkas' },
  });

  const matMng = await prisma.material.upsert({
    where: { code: 'MAT-MNG' },
    update: {},
    create: { name: 'Mangga', code: 'MAT-MNG', category: 'Buah', unit: 'kg', shelfLifeDays: 14, storageNote: 'Simpan di kulkas setelah matang' },
  });

  console.log('✅ Materials selesai');

  // ─── PRODUCTS ─────────────────────────────────────────────────────────────
  const prdEvn = await prisma.product.upsert({
    where: { code: 'PRD-EVN' },
    update: {},
    create: { name: 'Ekstrak Vanili 10x', code: 'PRD-EVN', category: 'Ekstrak Cair', unit: 'liter', shelfLifeDays: 730 },
  });

  const prdEjm = await prisma.product.upsert({
    where: { code: 'PRD-EJM' },
    update: {},
    create: { name: 'Ekstrak Jahe Merah', code: 'PRD-EJM', category: 'Ekstrak Cair', unit: 'liter', shelfLifeDays: 365 },
  });

  const prdBpd = await prisma.product.upsert({
    where: { code: 'PRD-BPD' },
    update: {},
    create: { name: 'Bubuk Pandan', code: 'PRD-BPD', category: 'Bubuk', unit: 'kg', shelfLifeDays: 180 },
  });

  const prdEkm = await prisma.product.upsert({
    where: { code: 'PRD-EKM' },
    update: {},
    create: { name: 'Ekstrak Kayu Manis', code: 'PRD-EKM', category: 'Ekstrak Cair', unit: 'liter', shelfLifeDays: 365 },
  });

  const prdBlm = await prisma.product.upsert({
    where: { code: 'PRD-BLM' },
    update: {},
    create: { name: 'Bubuk Lemon', code: 'PRD-BLM', category: 'Bubuk', unit: 'kg', shelfLifeDays: 270 },
  });

  console.log('✅ Products selesai');

  // ─── DELIVERY ORDERS ──────────────────────────────────────────────────────
  const do1 = await prisma.deliveryOrder.upsert({
    where: { doNumber: 'DO-20260510-001' },
    update: {},
    create: {
      doNumber: 'DO-20260510-001',
      receivedDate: new Date('2026-05-10'),
      supplierId: sup1.id,
      notes: 'Pengiriman vanili batch pertama bulan Mei',
    },
  });

  const do2 = await prisma.deliveryOrder.upsert({
    where: { doNumber: 'DO-20260515-001' },
    update: {},
    create: {
      doNumber: 'DO-20260515-001',
      receivedDate: new Date('2026-05-15'),
      supplierId: sup2.id,
      notes: 'Pengiriman bahan herbal batch Mei',
    },
  });

  const do3 = await prisma.deliveryOrder.upsert({
    where: { doNumber: 'DO-20260520-001' },
    update: {},
    create: {
      doNumber: 'DO-20260520-001',
      receivedDate: new Date('2026-05-20'),
      supplierId: sup3.id,
    },
  });

  console.log('✅ Delivery Orders selesai');

  // ─── RAW MATERIAL LOTS ────────────────────────────────────────────────────
  // 3 INCOMING
  const rl1 = await prisma.rawMaterialLot.upsert({
    where: { internalLotNo: 'SA-RM-20260510-001' },
    update: {},
    create: {
      internalLotNo: 'SA-RM-20260510-001',
      supplierLotNo: 'SUP-VNL-2026-01',
      currentStatus: 'INCOMING',
      initialQty: 50,
      receivedDate: new Date('2026-05-10'),
      expiryDate: new Date('2027-05-10'),
      deliveryOrderId: do1.id,
      supplierId: sup1.id,
      materialId: matVnl.id,
      createdById: operator.id,
      notes: 'Vanili grade A dari Madagascar',
    },
  });

  const rl2 = await prisma.rawMaterialLot.upsert({
    where: { internalLotNo: 'SA-RM-20260515-001' },
    update: {},
    create: {
      internalLotNo: 'SA-RM-20260515-001',
      supplierLotNo: 'SUP-JHM-2026-01',
      currentStatus: 'INCOMING',
      initialQty: 100,
      receivedDate: new Date('2026-05-15'),
      expiryDate: new Date('2026-11-15'),
      deliveryOrderId: do2.id,
      supplierId: sup2.id,
      materialId: matJhm.id,
      createdById: operator.id,
    },
  });

  const rl3 = await prisma.rawMaterialLot.upsert({
    where: { internalLotNo: 'SA-RM-20260520-001' },
    update: {},
    create: {
      internalLotNo: 'SA-RM-20260520-001',
      supplierLotNo: 'SUP-LMN-2026-01',
      currentStatus: 'INCOMING',
      initialQty: 200,
      receivedDate: new Date('2026-05-20'),
      expiryDate: new Date('2026-06-19'),
      deliveryOrderId: do3.id,
      supplierId: sup3.id,
      materialId: matLmn.id,
      createdById: operator.id,
    },
  });

  // 2 QC_PENDING
  const rl4 = await prisma.rawMaterialLot.upsert({
    where: { internalLotNo: 'SA-RM-20260505-001' },
    update: {},
    create: {
      internalLotNo: 'SA-RM-20260505-001',
      supplierLotNo: 'SUP-PDN-2026-01',
      currentStatus: 'QC_PENDING',
      initialQty: 75,
      receivedDate: new Date('2026-05-05'),
      expiryDate: new Date('2026-08-05'),
      supplierId: sup2.id,
      materialId: matPdn.id,
      createdById: operator.id,
    },
  });

  const rl5 = await prisma.rawMaterialLot.upsert({
    where: { internalLotNo: 'SA-RM-20260505-002' },
    update: {},
    create: {
      internalLotNo: 'SA-RM-20260505-002',
      supplierLotNo: 'SUP-KYM-2026-01',
      currentStatus: 'QC_PENDING',
      initialQty: 60,
      receivedDate: new Date('2026-05-05'),
      expiryDate: new Date('2027-05-05'),
      supplierId: sup1.id,
      materialId: matKym.id,
      createdById: operator.id,
    },
  });

  // 2 QC_APPROVED
  const rl6 = await prisma.rawMaterialLot.upsert({
    where: { internalLotNo: 'SA-RM-20260501-001' },
    update: {},
    create: {
      internalLotNo: 'SA-RM-20260501-001',
      supplierLotNo: 'SUP-JHM-2026-A1',
      currentStatus: 'QC_APPROVED',
      initialQty: 120,
      receivedDate: new Date('2026-05-01'),
      expiryDate: new Date('2026-11-01'),
      supplierId: sup2.id,
      materialId: matJhm.id,
      createdById: operator.id,
    },
  });

  const rl7 = await prisma.rawMaterialLot.upsert({
    where: { internalLotNo: 'SA-RM-20260501-002' },
    update: {},
    create: {
      internalLotNo: 'SA-RM-20260501-002',
      supplierLotNo: 'SUP-BGT-2026-01',
      currentStatus: 'QC_APPROVED',
      initialQty: 40,
      receivedDate: new Date('2026-05-01'),
      expiryDate: new Date('2026-09-01'),
      supplierId: sup4.id,
      materialId: matBgt.id,
      createdById: operator.id,
    },
  });

  // 1 IN_PRODUCTION
  const rl8 = await prisma.rawMaterialLot.upsert({
    where: { internalLotNo: 'SA-RM-20260425-001' },
    update: {},
    create: {
      internalLotNo: 'SA-RM-20260425-001',
      supplierLotNo: 'SUP-VNL-2026-A1',
      currentStatus: 'IN_PRODUCTION',
      initialQty: 30,
      receivedDate: new Date('2026-04-25'),
      expiryDate: new Date('2027-04-25'),
      supplierId: sup1.id,
      materialId: matVnl.id,
      createdById: operator.id,
    },
  });

  // 1 QC_REJECTED
  const rl9 = await prisma.rawMaterialLot.upsert({
    where: { internalLotNo: 'SA-RM-20260428-001' },
    update: {},
    create: {
      internalLotNo: 'SA-RM-20260428-001',
      supplierLotNo: 'SUP-MNG-2026-01',
      currentStatus: 'QC_REJECTED',
      initialQty: 80,
      receivedDate: new Date('2026-04-28'),
      expiryDate: new Date('2026-05-12'),
      supplierId: sup3.id,
      materialId: matMng.id,
      createdById: operator.id,
      notes: 'Mangga sudah terlalu matang saat datang',
    },
  });

  // 1 CONSUMED
  const rl10 = await prisma.rawMaterialLot.upsert({
    where: { internalLotNo: 'SA-RM-20260410-001' },
    update: {},
    create: {
      internalLotNo: 'SA-RM-20260410-001',
      supplierLotNo: 'SUP-JHM-2026-B1',
      currentStatus: 'CONSUMED',
      initialQty: 90,
      receivedDate: new Date('2026-04-10'),
      expiryDate: new Date('2026-10-10'),
      supplierId: sup2.id,
      materialId: matJhm.id,
      createdById: operator.id,
    },
  });

  console.log('✅ Raw Material Lots selesai');

  // ─── RAW LOT STAGES ───────────────────────────────────────────────────────
  // Stage awal untuk setiap lot
  const stageData = [
    { rawLotId: rl1.id, stage: 'INCOMING', actorId: operator.id, timestamp: new Date('2026-05-10') },
    { rawLotId: rl2.id, stage: 'INCOMING', actorId: operator.id, timestamp: new Date('2026-05-15') },
    { rawLotId: rl3.id, stage: 'INCOMING', actorId: operator.id, timestamp: new Date('2026-05-20') },
    { rawLotId: rl4.id, stage: 'INCOMING', actorId: operator.id, timestamp: new Date('2026-05-05') },
    { rawLotId: rl4.id, stage: 'QC_PENDING', actorId: operator.id, timestamp: new Date('2026-05-06') },
    { rawLotId: rl5.id, stage: 'INCOMING', actorId: operator.id, timestamp: new Date('2026-05-05') },
    { rawLotId: rl5.id, stage: 'QC_PENDING', actorId: operator.id, timestamp: new Date('2026-05-06') },
    { rawLotId: rl6.id, stage: 'INCOMING', actorId: operator.id, timestamp: new Date('2026-05-01') },
    { rawLotId: rl6.id, stage: 'QC_PENDING', actorId: operator.id, timestamp: new Date('2026-05-02') },
    { rawLotId: rl6.id, stage: 'QC_APPROVED', actorId: qcStaff.id, timestamp: new Date('2026-05-03') },
    { rawLotId: rl7.id, stage: 'INCOMING', actorId: operator.id, timestamp: new Date('2026-05-01') },
    { rawLotId: rl7.id, stage: 'QC_PENDING', actorId: operator.id, timestamp: new Date('2026-05-02') },
    { rawLotId: rl7.id, stage: 'QC_APPROVED', actorId: qcStaff.id, timestamp: new Date('2026-05-03') },
    { rawLotId: rl8.id, stage: 'INCOMING', actorId: operator.id, timestamp: new Date('2026-04-25') },
    { rawLotId: rl8.id, stage: 'QC_PENDING', actorId: operator.id, timestamp: new Date('2026-04-26') },
    { rawLotId: rl8.id, stage: 'QC_APPROVED', actorId: qcStaff.id, timestamp: new Date('2026-04-27') },
    { rawLotId: rl8.id, stage: 'IN_PRODUCTION', actorId: ppic.id, timestamp: new Date('2026-04-28') },
    { rawLotId: rl9.id, stage: 'INCOMING', actorId: operator.id, timestamp: new Date('2026-04-28') },
    { rawLotId: rl9.id, stage: 'QC_PENDING', actorId: operator.id, timestamp: new Date('2026-04-29') },
    { rawLotId: rl9.id, stage: 'QC_REJECTED', actorId: qcStaff.id, timestamp: new Date('2026-04-30'), notes: 'Warna dan tekstur tidak sesuai standar' },
    { rawLotId: rl10.id, stage: 'INCOMING', actorId: operator.id, timestamp: new Date('2026-04-10') },
    { rawLotId: rl10.id, stage: 'QC_PENDING', actorId: operator.id, timestamp: new Date('2026-04-11') },
    { rawLotId: rl10.id, stage: 'QC_APPROVED', actorId: qcStaff.id, timestamp: new Date('2026-04-12') },
    { rawLotId: rl10.id, stage: 'IN_PRODUCTION', actorId: ppic.id, timestamp: new Date('2026-04-15') },
    { rawLotId: rl10.id, stage: 'CONSUMED', actorId: ppic.id, timestamp: new Date('2026-04-20') },
  ];

  for (const s of stageData) {
    await prisma.rawLotStage.create({ data: s });
  }

  console.log('✅ Raw Lot Stages selesai');

  // ─── QC INSPECTIONS ───────────────────────────────────────────────────────
  await prisma.qCInspection.create({
    data: {
      rawLotId: rl6.id,
      result: 'APPROVED',
      colorScore: 9,
      odorScore: 9,
      textureScore: 8,
      moistureLevel: 12.5,
      inspectedById: qcStaff.id,
      inspectedAt: new Date('2026-05-03'),
      notes: 'Kualitas jahe merah sangat baik',
    },
  });

  await prisma.qCInspection.create({
    data: {
      rawLotId: rl7.id,
      result: 'APPROVED',
      colorScore: 8,
      odorScore: 9,
      textureScore: 8,
      moistureLevel: 10.2,
      inspectedById: qcStaff.id,
      inspectedAt: new Date('2026-05-03'),
    },
  });

  await prisma.qCInspection.create({
    data: {
      rawLotId: rl8.id,
      result: 'APPROVED',
      colorScore: 10,
      odorScore: 10,
      textureScore: 9,
      moistureLevel: 8.7,
      inspectedById: qcStaff.id,
      inspectedAt: new Date('2026-04-27'),
      notes: 'Vanili premium kualitas terbaik',
    },
  });

  await prisma.qCInspection.create({
    data: {
      rawLotId: rl9.id,
      result: 'REJECTED',
      colorScore: 3,
      odorScore: 4,
      textureScore: 2,
      moistureLevel: 85.0,
      inspectedById: qcStaff.id,
      inspectedAt: new Date('2026-04-30'),
      notes: 'Mangga terlalu matang, kadar air tinggi, tidak layak produksi',
    },
  });

  await prisma.qCInspection.create({
    data: {
      rawLotId: rl10.id,
      result: 'APPROVED',
      colorScore: 8,
      odorScore: 8,
      textureScore: 9,
      moistureLevel: 13.0,
      inspectedById: qcStaff.id,
      inspectedAt: new Date('2026-04-12'),
    },
  });

  console.log('✅ QC Inspections selesai');

  // ─── PRODUCTION ORDERS ────────────────────────────────────────────────────
  // 1 QUEUED
  const po1 = await prisma.productionOrder.upsert({
    where: { orderNumber: 'PO-20260520-001' },
    update: {},
    create: {
      orderNumber: 'PO-20260520-001',
      status: 'QUEUED',
      priority: 1,
      targetQty: 50,
      scheduledDate: new Date('2026-06-01'),
      productId: prdEkm.id,
      createdById: ppic.id,
      notes: 'Produksi ekstrak kayu manis untuk Q2',
    },
  });

  // 1 IN_PROGRESS
  const po2 = await prisma.productionOrder.upsert({
    where: { orderNumber: 'PO-20260425-001' },
    update: {},
    create: {
      orderNumber: 'PO-20260425-001',
      status: 'IN_PROGRESS',
      priority: 3,
      targetQty: 100,
      scheduledDate: new Date('2026-04-28'),
      startedAt: new Date('2026-04-28'),
      productId: prdEvn.id,
      createdById: ppic.id,
      notes: 'Produksi ekstrak vanili batch April',
    },
  });

  // Link rl8 (IN_PRODUCTION) ke po2
  await prisma.productionInput.create({
    data: {
      productionOrderId: po2.id,
      rawLotId: rl8.id,
      materialId: matVnl.id,
      qtyUsed: 25,
      usedAt: new Date('2026-04-28'),
    },
  });

  // 1 COMPLETED
  const po3 = await prisma.productionOrder.upsert({
    where: { orderNumber: 'PO-20260410-001' },
    update: {},
    create: {
      orderNumber: 'PO-20260410-001',
      status: 'COMPLETED',
      priority: 2,
      targetQty: 80,
      actualQty: 78,
      scheduledDate: new Date('2026-04-15'),
      startedAt: new Date('2026-04-15'),
      completedAt: new Date('2026-04-20'),
      productId: prdEjm.id,
      createdById: ppic.id,
      notes: 'Produksi ekstrak jahe merah batch April',
    },
  });

  // Link rl10 (CONSUMED) ke po3
  await prisma.productionInput.create({
    data: {
      productionOrderId: po3.id,
      rawLotId: rl10.id,
      materialId: matJhm.id,
      qtyUsed: 90,
      usedAt: new Date('2026-04-15'),
    },
  });

  console.log('✅ Production Orders selesai');

  // ─── FINISHED GOODS LOTS ──────────────────────────────────────────────────
  // 1 IN_WAREHOUSE
  const fg1 = await prisma.finishedGoodsLot.upsert({
    where: { lotNumber: 'SA-FG-20260420-001' },
    update: {},
    create: {
      lotNumber: 'SA-FG-20260420-001',
      currentStatus: 'IN_WAREHOUSE',
      quantity: 78,
      unit: 'liter',
      warehouseZone: 'A',
      warehousePosition: 'A-03-02',
      producedAt: new Date('2026-04-20'),
      expiryDate: new Date('2027-04-20'),
      productId: prdEjm.id,
      productionOrderId: po3.id,
      notes: 'Batch April - kualitas baik',
    },
  });

  await prisma.finishedLotStage.create({
    data: { finishedLotId: fg1.id, stage: 'PRODUCED', actorId: ppic.id, timestamp: new Date('2026-04-20') },
  });
  await prisma.finishedLotStage.create({
    data: { finishedLotId: fg1.id, stage: 'QC_PENDING', actorId: ppic.id, timestamp: new Date('2026-04-21') },
  });
  await prisma.finishedLotStage.create({
    data: { finishedLotId: fg1.id, stage: 'QC_APPROVED', actorId: qcStaff.id, timestamp: new Date('2026-04-22') },
  });
  await prisma.finishedLotStage.create({
    data: { finishedLotId: fg1.id, stage: 'IN_WAREHOUSE', actorId: operator.id, timestamp: new Date('2026-04-23') },
  });

  // QC untuk fg1
  await prisma.qCInspection.create({
    data: {
      finishedLotId: fg1.id,
      result: 'APPROVED',
      colorScore: 9,
      odorScore: 9,
      textureScore: 8,
      moistureLevel: 11.5,
      inspectedById: qcStaff.id,
      inspectedAt: new Date('2026-04-22'),
      notes: 'Produk jadi memenuhi standar kualitas',
    },
  });

  // 1 PARTIALLY_DISPATCHED
  const fg2 = await prisma.finishedGoodsLot.upsert({
    where: { lotNumber: 'SA-FG-20260420-002' },
    update: {},
    create: {
      lotNumber: 'SA-FG-20260420-002',
      currentStatus: 'PARTIALLY_DISPATCHED',
      quantity: 78,
      unit: 'liter',
      warehouseZone: 'A',
      warehousePosition: 'A-03-03',
      producedAt: new Date('2026-04-20'),
      expiryDate: new Date('2027-04-20'),
      productId: prdEjm.id,
      productionOrderId: po3.id,
    },
  });

  await prisma.finishedLotStage.create({
    data: { finishedLotId: fg2.id, stage: 'PRODUCED', actorId: ppic.id, timestamp: new Date('2026-04-20') },
  });
  await prisma.finishedLotStage.create({
    data: { finishedLotId: fg2.id, stage: 'QC_APPROVED', actorId: qcStaff.id, timestamp: new Date('2026-04-22') },
  });
  await prisma.finishedLotStage.create({
    data: { finishedLotId: fg2.id, stage: 'IN_WAREHOUSE', actorId: operator.id, timestamp: new Date('2026-04-23') },
  });
  await prisma.finishedLotStage.create({
    data: { finishedLotId: fg2.id, stage: 'PARTIALLY_DISPATCHED', actorId: manager.id, timestamp: new Date('2026-05-05') },
  });

  console.log('✅ Finished Goods Lots selesai');

  // ─── SAMPLE DISPATCHES ────────────────────────────────────────────────────
  // 1 LOCAL confirmed
  const sd1 = await prisma.sampleDispatch.upsert({
    where: { dispatchNumber: 'SD-20260505-001' },
    update: {},
    create: {
      dispatchNumber: 'SD-20260505-001',
      customerName: 'PT Indofood Sukses Makmur',
      customerEmail: 'procurement@indofood.co.id',
      customerPhone: '02154321234',
      destination: 'LOCAL',
      quantity: 5,
      unit: 'liter',
      dispatchDate: new Date('2026-05-05'),
      trackingNumber: 'JNE-2026050500001',
      receivedConfirmed: true,
      receivedAt: new Date('2026-05-07'),
      finishedLotId: fg2.id,
      dispatchedById: manager.id,
      notes: 'Sampel untuk evaluasi produk baru',
    },
  });

  // 1 LOCAL pending
  const sd2 = await prisma.sampleDispatch.upsert({
    where: { dispatchNumber: 'SD-20260515-001' },
    update: {},
    create: {
      dispatchNumber: 'SD-20260515-001',
      customerName: 'CV Bakers Delight',
      customerEmail: 'order@bakersdelight.id',
      customerPhone: '02198765432',
      destination: 'LOCAL',
      quantity: 3,
      unit: 'liter',
      dispatchDate: new Date('2026-05-15'),
      receivedConfirmed: false,
      finishedLotId: fg1.id,
      dispatchedById: manager.id,
    },
  });

  // 1 EXPORT pending
  const sd3 = await prisma.sampleDispatch.upsert({
    where: { dispatchNumber: 'SD-20260518-001' },
    update: {},
    create: {
      dispatchNumber: 'SD-20260518-001',
      customerName: 'Givaudan Singapore Pte Ltd',
      customerEmail: 'procurement@givaudan.sg',
      destination: 'EXPORT',
      country: 'Singapore',
      quantity: 10,
      unit: 'liter',
      dispatchDate: new Date('2026-05-18'),
      trackingNumber: 'DHL-2026051800042',
      receivedConfirmed: false,
      finishedLotId: fg2.id,
      dispatchedById: manager.id,
      notes: 'Sampel untuk potential buyer di Singapore',
    },
  });

  console.log('✅ Sample Dispatches selesai');
  console.log('');
  console.log('🎉 Seed data berhasil dimasukkan!');
  console.log('');
  console.log('Test Credentials:');
  console.log('  operator@sima.com / SimaArome@2026');
  console.log('  qc@sima.com / SimaArome@2026');
  console.log('  ppic@sima.com / SimaArome@2026');
  console.log('  manager@sima.com / SimaArome@2026');
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
