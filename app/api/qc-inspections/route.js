import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { logAudit } from '@/lib/server/audit';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { data } = await supabase.from('qc_inspections')
    .select('*, inspected_by:users(id, name)').order('inspected_at', { ascending: false });
  return Response.json({ success: true, data: data || [], message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'QC_STAFF', 'MANAGER')) return forbidden();

  const body = await request.json();
  const { rawLotId, finishedLotId, result, colorScore, odorScore, textureScore, moistureLevel, notes } = body;
  const raw_lot_id = rawLotId || body.raw_lot_id;
  const finished_lot_id = finishedLotId || body.finished_lot_id;

  if (!result) return Response.json({ success: false, data: null, message: 'result wajib diisi' }, { status: 400 });
  if (!raw_lot_id && !finished_lot_id) return Response.json({ success: false, data: null, message: 'rawLotId atau finishedLotId wajib diisi' }, { status: 400 });

  const statusMap = { APPROVED: 'QC_APPROVED', REJECTED: 'QC_REJECTED', ON_HOLD: 'ON_HOLD' };
  const newStatus = statusMap[result];

  const { data: qc, error } = await supabase.from('qc_inspections').insert({
    raw_lot_id: raw_lot_id || null,
    finished_lot_id: finished_lot_id || null,
    result,
    color_score: colorScore || body.color_score || null,
    odor_score: odorScore || body.odor_score || null,
    texture_score: textureScore || body.texture_score || null,
    moisture_level: moistureLevel || body.moisture_level || null,
    notes,
    inspected_by_id: user.id,
  }).select().single();

  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });

  if (raw_lot_id) {
    await supabase.from('raw_material_lots').update({ current_status: newStatus }).eq('id', raw_lot_id);
    await supabase.from('raw_lot_stages').insert({ raw_lot_id, stage: newStatus, actor_id: user.id, notes: `QC: ${result}` });
  }

  if (finished_lot_id) {
    await supabase.from('finished_goods_lots').update({ current_status: newStatus }).eq('id', finished_lot_id);
    await supabase.from('finished_lot_stages').insert({ finished_lot_id, stage: newStatus, actor_id: user.id, notes: `QC: ${result}` });
  }

  await logAudit({ action: 'QC_INSPECTION', entityType: raw_lot_id ? 'RAW_LOT' : 'FINISHED_LOT', entityId: raw_lot_id || finished_lot_id, description: `QC ${result} — Color:${body.colorScore||'-'} Odor:${body.odorScore||'-'} Texture:${body.textureScore||'-'}`, metadata: { result, color_score: body.colorScore, odor_score: body.odorScore }, user });

  return Response.json({ success: true, data: qc, message: 'QC Inspection berhasil disimpan' }, { status: 201 });
}
