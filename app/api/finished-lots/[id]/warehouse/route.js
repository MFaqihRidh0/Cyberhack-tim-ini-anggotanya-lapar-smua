import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'OPERATOR', 'MANAGER')) return forbidden();

  const { id } = await params;
  const body = await request.json();
  const warehouseZone = body.warehouseZone || body.warehouse_zone;
  const warehousePosition = body.warehousePosition || body.warehouse_position;

  if (!warehouseZone || !warehousePosition) {
    return Response.json({ success: false, data: null, message: 'warehouseZone dan warehousePosition wajib diisi' }, { status: 400 });
  }

  const { data: lot } = await supabase.from('finished_goods_lots').select('id, current_status').eq('id', id).single();
  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  const moveToWarehouse = ['PRODUCED', 'QC_APPROVED'].includes(lot.current_status);
  const updateData = { warehouse_zone: warehouseZone, warehouse_position: warehousePosition };
  if (moveToWarehouse) updateData.current_status = 'IN_WAREHOUSE';

  await supabase.from('finished_goods_lots').update(updateData).eq('id', id);

  if (moveToWarehouse) {
    await supabase.from('finished_lot_stages').insert({ finished_lot_id: id, stage: 'IN_WAREHOUSE', actor_id: user.id, notes: `Disimpan di ${warehouseZone} / ${warehousePosition}` });
  }

  return Response.json({ success: true, data: { id, ...updateData }, message: moveToWarehouse ? 'Status → IN_WAREHOUSE' : 'Posisi gudang diupdate' });
}
