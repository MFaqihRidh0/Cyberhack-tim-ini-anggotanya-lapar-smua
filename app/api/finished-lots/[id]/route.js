import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized } from '@/lib/server/auth';

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { data: lot } = await supabase.from('finished_goods_lots').select('*, product:products(*), production_order:production_orders(*)').eq('id', id).single();
  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  const { data: stages } = await supabase.from('finished_lot_stages').select('*, actor:users(id, name, role)').eq('finished_lot_id', id).order('timestamp');
  const { data: qcInspections } = await supabase.from('qc_inspections').select('*, inspected_by:users(id, name)').eq('finished_lot_id', id).order('inspected_at', { ascending: false });
  const { data: sampleDispatches } = await supabase.from('sample_dispatches').select('*, dispatched_by:users(id, name)').eq('finished_lot_id', id).order('dispatch_date', { ascending: false });

  return Response.json({ success: true, data: { ...lot, stages, qcInspections, sampleDispatches }, message: 'Berhasil' });
}
