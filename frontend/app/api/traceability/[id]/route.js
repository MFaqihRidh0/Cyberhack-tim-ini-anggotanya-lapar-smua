import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized } from '@/lib/server/auth';

/**
 * Full traceability chain for a raw material lot or finished goods lot.
 * Traces the complete journey: Supplier → DO → Raw Lot → QC → Production → Finished Lot → Dispatch
 * This is the "one source of truth" — no double entry, full visibility.
 */
export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'raw'; // 'raw' or 'finished'

  try {
    if (type === 'raw') {
      return await traceRawLot(id);
    } else {
      return await traceFinishedLot(id);
    }
  } catch (err) {
    return Response.json({ success: false, data: null, message: err.message }, { status: 500 });
  }
}

async function traceRawLot(lotId) {
  // Get the raw lot with all relations
  const { data: lot } = await supabase.from('raw_material_lots')
    .select('*, material:materials(*), supplier:suppliers(*), delivery_order:delivery_orders(*)')
    .eq('id', lotId).single();

  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  // Get stages
  const { data: stages } = await supabase.from('raw_lot_stages')
    .select('*, actor:users(id, name, role)').eq('raw_lot_id', lotId).order('timestamp');

  // Get QC inspections
  const { data: qcInspections } = await supabase.from('qc_inspections')
    .select('*, inspected_by:users(id, name)').eq('raw_lot_id', lotId).order('inspected_at');

  // Get production usage
  const { data: productionInputs } = await supabase.from('production_inputs')
    .select('*, production_order:production_orders(id, order_number, status, product:products(name))').eq('raw_lot_id', lotId);

  // Get finished goods produced from this lot's production orders
  const poIds = (productionInputs || []).map(i => i.production_order_id);
  let finishedGoods = [];
  if (poIds.length > 0) {
    const { data: fg } = await supabase.from('finished_goods_lots')
      .select('*, product:products(name)').in('production_order_id', poIds);
    finishedGoods = fg || [];
  }

  // Get dispatches from those finished goods
  const fgIds = finishedGoods.map(f => f.id);
  let dispatches = [];
  if (fgIds.length > 0) {
    const { data: d } = await supabase.from('sample_dispatches')
      .select('*').in('finished_lot_id', fgIds);
    dispatches = d || [];
  }

  const traceChain = {
    type: 'RAW_LOT_TRACE',
    lot,
    supplier: lot.supplier,
    deliveryOrder: lot.delivery_order,
    stages: stages || [],
    qcInspections: qcInspections || [],
    productionUsage: productionInputs || [],
    finishedGoods,
    dispatches,
    summary: {
      totalStages: (stages || []).length,
      currentStatus: lot.current_status,
      daysInSystem: Math.floor((new Date() - new Date(lot.date_created)) / (1000 * 60 * 60 * 24)),
      usedInProduction: (productionInputs || []).reduce((s, i) => s + i.qty_used, 0),
      remainingQty: lot.initial_qty - (productionInputs || []).reduce((s, i) => s + i.qty_used, 0),
      producedFinishedGoods: finishedGoods.length,
      totalDispatched: dispatches.length,
    },
  };

  return Response.json({ success: true, data: traceChain, message: 'Berhasil' });
}

async function traceFinishedLot(lotId) {
  const { data: lot } = await supabase.from('finished_goods_lots')
    .select('*, product:products(*), production_order:production_orders(*)').eq('id', lotId).single();

  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  // Get raw materials used in this production order
  const { data: inputs } = await supabase.from('production_inputs')
    .select('*, raw_lot:raw_material_lots(*, material:materials(*), supplier:suppliers(name))').eq('production_order_id', lot.production_order_id);

  // Get stages
  const { data: stages } = await supabase.from('finished_lot_stages')
    .select('*, actor:users(id, name, role)').eq('finished_lot_id', lotId).order('timestamp');

  // Get QC
  const { data: qcInspections } = await supabase.from('qc_inspections')
    .select('*, inspected_by:users(id, name)').eq('finished_lot_id', lotId);

  // Get dispatches
  const { data: dispatches } = await supabase.from('sample_dispatches')
    .select('*, dispatched_by:users(id, name)').eq('finished_lot_id', lotId);

  const traceChain = {
    type: 'FINISHED_LOT_TRACE',
    lot,
    product: lot.product,
    productionOrder: lot.production_order,
    rawMaterialInputs: inputs || [],
    stages: stages || [],
    qcInspections: qcInspections || [],
    dispatches: dispatches || [],
    summary: {
      totalStages: (stages || []).length,
      currentStatus: lot.current_status,
      daysInSystem: Math.floor((new Date() - new Date(lot.date_created)) / (1000 * 60 * 60 * 24)),
      rawMaterialsUsed: (inputs || []).length,
      totalDispatched: dispatches.length,
      dispatchedQty: (dispatches || []).reduce((s, d) => s + d.quantity, 0),
    },
  };

  return Response.json({ success: true, data: traceChain, message: 'Berhasil' });
}
