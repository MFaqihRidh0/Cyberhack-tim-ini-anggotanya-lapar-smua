import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized } from '@/lib/server/auth';
import QRCode from 'qrcode';

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { data: lot } = await supabase.from('finished_goods_lots').select('id, lot_number, current_status, product:products(name)').eq('id', id).single();
  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  const qrData = JSON.stringify({ type: 'FINISHED_LOT', id: lot.id, lotNumber: lot.lot_number, product: lot.product?.name, status: lot.current_status });
  const buffer = await QRCode.toBuffer(qrData, { type: 'png', width: 300, margin: 2 });

  return new Response(buffer, { headers: { 'Content-Type': 'image/png' } });
}
