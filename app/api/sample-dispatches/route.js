import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { generateLotNumber } from '@/lib/server/lotNumber';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { data } = await supabase.from('sample_dispatches').select('*, finished_lot:finished_goods_lots(*, product:products(*)), dispatched_by:users(id, name)').order('dispatch_date', { ascending: false });
  return Response.json({ success: true, data: data || [], message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'MANAGER')) return forbidden();

  const body = await request.json();
  const finishedLotId = body.finishedLotId || body.finished_lot_id;
  const { customerName, customer_name, destination, country, quantity, unit, trackingNumber, tracking_number, notes } = body;
  const custName = customerName || customer_name;

  if (!finishedLotId || !custName || !quantity || !destination) {
    return Response.json({ success: false, data: null, message: 'finishedLotId, customerName, quantity, destination wajib diisi' }, { status: 400 });
  }
  if (destination === 'EXPORT' && !country) {
    return Response.json({ success: false, data: null, message: 'country wajib diisi untuk EXPORT' }, { status: 400 });
  }

  const { data: lot } = await supabase.from('finished_goods_lots').select('id, quantity').eq('id', finishedLotId).single();
  if (!lot) return Response.json({ success: false, data: null, message: 'Finished Lot tidak ditemukan' }, { status: 404 });

  const dispatch_number = await generateLotNumber('SD');
  // When dispatched but pending confirmation → PARTIALLY_DISPATCHED
  const newStatus = 'PARTIALLY_DISPATCHED';

  const { data: dispatch, error } = await supabase.from('sample_dispatches').insert({
    dispatch_number, finished_lot_id: finishedLotId, customer_name: custName,
    customer_email: body.customerEmail || body.customer_email || null,
    customer_phone: body.customerPhone || body.customer_phone || null,
    destination, country: destination === 'EXPORT' ? country : null,
    quantity: Number(quantity), unit: unit || 'kg',
    tracking_number: trackingNumber || tracking_number || null, notes, dispatched_by_id: user.id,
    dispatch_date: new Date().toISOString(),
  }).select().single();

  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });

  await supabase.from('finished_goods_lots').update({ current_status: newStatus }).eq('id', finishedLotId);
  await supabase.from('finished_lot_stages').insert({ finished_lot_id: finishedLotId, stage: newStatus, actor_id: user.id, notes: `Dispatch ke ${custName}` });

  return Response.json({ success: true, data: dispatch, message: 'Sample Dispatch berhasil dibuat' }, { status: 201 });
}
