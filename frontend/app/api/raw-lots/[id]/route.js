import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized } from '@/lib/server/auth';

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { data: lot } = await supabase.from('raw_material_lots')
    .select('*, material:materials(*), supplier:suppliers(*), delivery_order:delivery_orders(*)')
    .eq('id', id).single();

  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  const { data: stages } = await supabase.from('raw_lot_stages')
    .select('*, actor:users(id, name, role)').eq('raw_lot_id', id).order('timestamp');

  const { data: qcInspections } = await supabase.from('qc_inspections')
    .select('*, inspected_by:users(id, name, role)').eq('raw_lot_id', id).order('inspected_at', { ascending: false });

  const { data: productionInputs } = await supabase.from('production_inputs')
    .select('*, production_order:production_orders(id, order_number, status)').eq('raw_lot_id', id);

  const used = (productionInputs || []).reduce((sum, i) => sum + i.qty_used, 0);

  return Response.json({
    success: true,
    data: { ...lot, stages, qcInspections, productionInputs, remainingQty: lot.initial_qty - used },
    message: 'Berhasil',
  });
}
