import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function POST(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'PPIC', 'MANAGER')) return forbidden();

  const { id } = await params;
  const body = await request.json();
  const rawLotId = body.rawLotId || body.raw_lot_id;
  const materialId = body.materialId || body.material_id;
  const qtyUsed = body.qtyUsed || body.qty_used;

  if (!rawLotId || !qtyUsed) {
    return Response.json({ success: false, data: null, message: 'rawLotId dan qtyUsed wajib diisi' }, { status: 400 });
  }

  const { data: rawLot } = await supabase.from('raw_material_lots').select('*').eq('id', rawLotId).single();
  if (!rawLot) return Response.json({ success: false, data: null, message: 'Raw Lot tidak ditemukan' }, { status: 404 });

  if (!['QC_APPROVED', 'IN_QUEUE', 'IN_PRODUCTION'].includes(rawLot.current_status)) {
    return Response.json({ success: false, data: null, message: `Lot status ${rawLot.current_status} tidak bisa dipakai` }, { status: 400 });
  }

  const { data: existingInputs } = await supabase.from('production_inputs').select('qty_used').eq('raw_lot_id', rawLotId);
  const used = (existingInputs || []).reduce((s, i) => s + i.qty_used, 0);
  const remaining = rawLot.initial_qty - used;

  if (Number(qtyUsed) > remaining) {
    return Response.json({ success: false, data: null, message: `qtyUsed (${qtyUsed}) melebihi remaining (${remaining})` }, { status: 400 });
  }

  const { data: input, error } = await supabase.from('production_inputs').insert({
    production_order_id: id, raw_lot_id: rawLotId, material_id: materialId || rawLot.material_id, qty_used: Number(qtyUsed),
  }).select().single();

  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });

  if (rawLot.current_status !== 'IN_PRODUCTION') {
    await supabase.from('raw_material_lots').update({ current_status: 'IN_PRODUCTION' }).eq('id', rawLotId);
    await supabase.from('raw_lot_stages').insert({ raw_lot_id: rawLotId, stage: 'IN_PRODUCTION', actor_id: user.id, notes: 'Dipakai produksi' });
  }

  return Response.json({ success: true, data: input, message: 'Bahan baku ditambahkan' }, { status: 201 });
}
