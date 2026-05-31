import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { logAudit } from '@/lib/server/audit';

// Status finished goods yang valid (sesuai enum FinishedLotStatus)
const VALID_FINISHED_STATUSES = [
  'PRODUCED',
  'QC_PENDING',
  'QC_APPROVED',
  'QC_REJECTED',
  'IN_WAREHOUSE',
  'PARTIALLY_DISPATCHED',
  'FULLY_DISPATCHED',
  'ON_HOLD',
];

// Role yang berwenang mengubah status finished goods
const ALLOWED_ROLES = ['OPERATOR', 'QC_STAFF', 'MANAGER'];

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, ...ALLOWED_ROLES)) {
    return forbidden(`Role ${user.role} tidak diizinkan mengubah status finished goods`);
  }

  const { id } = await params;
  const { status, notes } = await request.json();

  if (!status) {
    return Response.json({ success: false, data: null, message: 'status wajib diisi' }, { status: 400 });
  }
  if (!VALID_FINISHED_STATUSES.includes(status)) {
    return Response.json({ success: false, data: null, message: `Status '${status}' tidak valid` }, { status: 400 });
  }

  const { data: lot } = await supabase
    .from('finished_goods_lots')
    .select('id, current_status')
    .eq('id', id)
    .single();
  if (!lot) {
    return Response.json({ success: false, data: null, message: 'Finished Goods Lot tidak ditemukan' }, { status: 404 });
  }

  if (lot.current_status === status) {
    return Response.json({ success: false, data: null, message: `Lot sudah berstatus ${status}` }, { status: 400 });
  }

  await supabase.from('finished_goods_lots').update({ current_status: status }).eq('id', id);
  await supabase.from('finished_lot_stages').insert({
    finished_lot_id: id,
    stage: status,
    actor_id: user.id,
    notes: notes || null,
  });

  await logAudit({
    action: 'STATUS_CHANGE',
    entityType: 'FINISHED_LOT',
    entityId: id,
    description: `Status diubah dari ${lot.current_status} ke ${status}`,
    metadata: { from: lot.current_status, to: status, notes },
    user,
  });

  return Response.json({ success: true, data: { id, current_status: status }, message: `Status lot diubah ke ${status}` });
}
