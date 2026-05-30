import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden } from '@/lib/server/auth';
import { logAudit } from '@/lib/server/audit';

const VALID_TRANSITIONS = {
  INCOMING: ['QC_PENDING', 'ON_HOLD'],
  QC_PENDING: ['QC_APPROVED', 'QC_REJECTED', 'ON_HOLD'],
  QC_APPROVED: ['IN_QUEUE', 'IN_PRODUCTION', 'ON_HOLD'],
  QC_REJECTED: ['ON_HOLD'],
  IN_QUEUE: ['IN_PRODUCTION', 'ON_HOLD'],
  IN_PRODUCTION: ['CONSUMED', 'ON_HOLD'],
  ON_HOLD: ['QC_PENDING', 'QC_APPROVED', 'IN_QUEUE', 'IN_PRODUCTION'],
  CONSUMED: [],
};

const STATUS_ROLE = {
  QC_PENDING: ['OPERATOR', 'MANAGER'],
  QC_APPROVED: ['QC_STAFF', 'MANAGER'],
  QC_REJECTED: ['QC_STAFF', 'MANAGER'],
  IN_QUEUE: ['PPIC', 'MANAGER'],
  IN_PRODUCTION: ['PPIC', 'MANAGER'],
  CONSUMED: ['PPIC', 'MANAGER'],
  ON_HOLD: ['QC_STAFF', 'PPIC', 'MANAGER'],
};

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { status, notes } = await request.json();

  if (!status) return Response.json({ success: false, data: null, message: 'status wajib diisi' }, { status: 400 });

  const { data: lot } = await supabase.from('raw_material_lots').select('id, current_status').eq('id', id).single();
  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  const allowed = VALID_TRANSITIONS[lot.current_status] || [];
  if (!allowed.includes(status)) {
    return Response.json({ success: false, data: null, message: `Transisi dari ${lot.current_status} ke ${status} tidak diperbolehkan` }, { status: 400 });
  }

  const allowedRoles = STATUS_ROLE[status] || [];
  if (!allowedRoles.includes(user.role)) {
    return forbidden(`Role ${user.role} tidak diizinkan mengubah status ke ${status}`);
  }

  await supabase.from('raw_material_lots').update({ current_status: status }).eq('id', id);
  await supabase.from('raw_lot_stages').insert({ raw_lot_id: id, stage: status, actor_id: user.id, notes });

  await logAudit({ action: 'STATUS_CHANGE', entityType: 'RAW_LOT', entityId: id, description: `Status diubah dari ${lot.current_status} ke ${status}`, metadata: { from: lot.current_status, to: status, notes }, user });

  return Response.json({ success: true, data: { id, current_status: status }, message: `Status lot diubah ke ${status}` });
}
