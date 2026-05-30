import supabase from './db';

export async function generateLotNumber(prefix) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const pattern = `${prefix}-${dateStr}-`;

  let table, field;
  switch (prefix) {
    case 'SA-RM': table = 'raw_material_lots'; field = 'internal_lot_no'; break;
    case 'SA-FG': table = 'finished_goods_lots'; field = 'lot_number'; break;
    case 'PO': table = 'production_orders'; field = 'order_number'; break;
    case 'SD': table = 'sample_dispatches'; field = 'dispatch_number'; break;
    default: throw new Error(`Unknown prefix: ${prefix}`);
  }

  const { data } = await supabase
    .from(table)
    .select(field)
    .like(field, `${pattern}%`)
    .order(field, { ascending: false })
    .limit(1);

  let seq = 1;
  if (data && data.length > 0) {
    const lastNum = parseInt(data[0][field].slice(-3), 10);
    seq = lastNum + 1;
  }

  return `${pattern}${String(seq).padStart(3, '0')}`;
}
