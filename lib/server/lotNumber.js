import prisma from './prisma';

export async function generateLotNumber(prefix) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const pattern = `${prefix}-${dateStr}-`;

  let model;
  let field;

  switch (prefix) {
    case 'SA-RM':
      model = prisma.rawMaterialLot;
      field = 'internalLotNo';
      break;
    case 'SA-FG':
      model = prisma.finishedGoodsLot;
      field = 'lotNumber';
      break;
    case 'PO':
      model = prisma.productionOrder;
      field = 'orderNumber';
      break;
    case 'SD':
      model = prisma.sampleDispatch;
      field = 'dispatchNumber';
      break;
    default:
      throw new Error(`Unknown prefix: ${prefix}`);
  }

  const last = await model.findFirst({
    where: { [field]: { startsWith: pattern } },
    orderBy: { [field]: 'desc' },
    select: { [field]: true },
  });

  let seq = 1;
  if (last) {
    const lastNum = parseInt(last[field].slice(-3), 10);
    seq = lastNum + 1;
  }

  return `${pattern}${String(seq).padStart(3, '0')}`;
}
