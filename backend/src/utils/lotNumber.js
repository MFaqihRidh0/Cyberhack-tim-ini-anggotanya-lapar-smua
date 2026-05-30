const prisma = require('./prisma');

async function generateLotNumber(prefix) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  const pattern = `${prefix}-${dateStr}-`;

  let lastNumber = 0;

  if (prefix === 'SA-RM') {
    const last = await prisma.rawMaterialLot.findFirst({
      where: { internalLotNo: { startsWith: pattern } },
      orderBy: { internalLotNo: 'desc' },
      select: { internalLotNo: true },
    });
    if (last) {
      const parts = last.internalLotNo.split('-');
      lastNumber = parseInt(parts[parts.length - 1], 10);
    }
  } else if (prefix === 'SA-FG') {
    const last = await prisma.finishedGoodsLot.findFirst({
      where: { lotNumber: { startsWith: pattern } },
      orderBy: { lotNumber: 'desc' },
      select: { lotNumber: true },
    });
    if (last) {
      const parts = last.lotNumber.split('-');
      lastNumber = parseInt(parts[parts.length - 1], 10);
    }
  } else if (prefix === 'PO') {
    const last = await prisma.productionOrder.findFirst({
      where: { orderNumber: { startsWith: pattern } },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });
    if (last) {
      const parts = last.orderNumber.split('-');
      lastNumber = parseInt(parts[parts.length - 1], 10);
    }
  } else if (prefix === 'SD') {
    const last = await prisma.sampleDispatch.findFirst({
      where: { dispatchNumber: { startsWith: pattern } },
      orderBy: { dispatchNumber: 'desc' },
      select: { dispatchNumber: true },
    });
    if (last) {
      const parts = last.dispatchNumber.split('-');
      lastNumber = parseInt(parts[parts.length - 1], 10);
    }
  }

  const seq = String(lastNumber + 1).padStart(3, '0');
  return `${pattern}${seq}`;
}

module.exports = { generateLotNumber };
