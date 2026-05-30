import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const [rawLotsRes, poRes, fgRes, rawStagesRes, fgStagesRes] = await Promise.all([
    supabase.from('raw_material_lots').select('current_status'),
    supabase.from('production_orders').select('status'),
    supabase.from('finished_goods_lots').select('current_status'),
    supabase.from('raw_lot_stages').select('*, actor:users(name), raw_lot:raw_material_lots(internal_lot_no)').order('timestamp', { ascending: false }).limit(10),
    supabase.from('finished_lot_stages').select('*, actor:users(name), finished_lot:finished_goods_lots(lot_number)').order('timestamp', { ascending: false }).limit(10),
  ]);

  const rawLots = { total: 0, incoming: 0, qcPending: 0, qcApproved: 0, inProduction: 0, rejected: 0 };
  for (const r of rawLotsRes.data || []) {
    rawLots.total++;
    if (r.current_status === 'INCOMING') rawLots.incoming++;
    if (r.current_status === 'QC_PENDING') rawLots.qcPending++;
    if (r.current_status === 'QC_APPROVED') rawLots.qcApproved++;
    if (r.current_status === 'IN_PRODUCTION') rawLots.inProduction++;
    if (r.current_status === 'QC_REJECTED') rawLots.rejected++;
  }

  const productionOrders = { total: 0, queued: 0, scheduled: 0, inProgress: 0, completed: 0 };
  for (const r of poRes.data || []) {
    productionOrders.total++;
    if (r.status === 'QUEUED') productionOrders.queued++;
    if (r.status === 'SCHEDULED') productionOrders.scheduled++;
    if (r.status === 'IN_PROGRESS') productionOrders.inProgress++;
    if (r.status === 'COMPLETED') productionOrders.completed++;
  }

  const finishedGoods = { total: 0, inWarehouse: 0, dispatched: 0 };
  for (const r of fgRes.data || []) {
    finishedGoods.total++;
    if (r.current_status === 'IN_WAREHOUSE') finishedGoods.inWarehouse++;
    if (['PARTIALLY_DISPATCHED', 'FULLY_DISPATCHED'].includes(r.current_status)) finishedGoods.dispatched++;
  }

  const recentActivity = [
    ...(rawStagesRes.data || []).map((s) => ({ type: 'RAW_LOT', lotNumber: s.raw_lot?.internal_lot_no, stage: s.stage, actor: s.actor?.name, timestamp: s.timestamp })),
    ...(fgStagesRes.data || []).map((s) => ({ type: 'FINISHED_LOT', lotNumber: s.finished_lot?.lot_number, stage: s.stage, actor: s.actor?.name, timestamp: s.timestamp })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

  return Response.json({ success: true, data: { rawLots, productionOrders, finishedGoods, recentActivity }, message: 'Berhasil' });
}
