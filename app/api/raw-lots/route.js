import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { generateLotNumber } from '@/lib/server/lotNumber';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase.from('raw_material_lots').select('*, material:materials(*), supplier:suppliers(*)').order('date_created', { ascending: false });
  if (status) query = query.eq('current_status', status);

  const { data } = await query;
  return Response.json({ success: true, data: data || [], message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'OPERATOR', 'MANAGER')) return forbidden();

  const body = await request.json();
  const supplierId = body.supplier_id || body.supplierId;
  const materialId = body.material_id || body.materialId;
  const initialQty = body.initial_qty || body.initialQty;
  const deliveryOrderId = body.delivery_order_id || body.deliveryOrderId;

  if (!supplierId || !materialId || !initialQty) {
    return Response.json({ success: false, data: null, message: 'supplierId, materialId, dan initialQty wajib diisi' }, { status: 400 });
  }

  const internal_lot_no = await generateLotNumber('SA-RM');

  const { data: lot, error } = await supabase.from('raw_material_lots').insert({
    internal_lot_no,
    supplier_lot_no: body.supplier_lot_no || body.supplierLotNo || null,
    initial_qty: Number(initialQty),
    current_status: 'INCOMING',
    delivery_order_id: deliveryOrderId || null,
    supplier_id: supplierId,
    material_id: materialId,
    created_by_id: user.id,
    manufactured_date: body.manufactured_date || body.manufacturedDate || null,
    expiry_date: body.expiry_date || body.expiryDate || null,
    notes: body.notes || null,
  }).select('*, material:materials(*), supplier:suppliers(*)').single();

  if (error) return Response.json({ success: false, data: null, message: error.message }, { status: 400 });

  // Create initial stage
  await supabase.from('raw_lot_stages').insert({ raw_lot_id: lot.id, stage: 'INCOMING', actor_id: user.id, notes: 'Lot diterima' });

  return Response.json({ success: true, data: lot, message: 'Raw Material Lot berhasil dibuat' }, { status: 201 });
}
