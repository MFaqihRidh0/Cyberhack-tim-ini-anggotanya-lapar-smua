import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized } from '@/lib/server/auth';
import QRCode from 'qrcode';

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { data: lot } = await supabase.from('raw_material_lots')
    .select('id, internal_lot_no, current_status, material:materials(name)').eq('id', id).single();

  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  const qrData = JSON.stringify({ type: 'RAW_LOT', id: lot.id, lotNumber: lot.internal_lot_no, material: lot.material?.name, status: lot.current_status });
  const buffer = await QRCode.toBuffer(qrData, { type: 'png', width: 300, margin: 2 });

  return new Response(buffer, { headers: { 'Content-Type': 'image/png' } });
}
