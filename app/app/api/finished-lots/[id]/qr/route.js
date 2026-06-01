import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized } from '@/lib/server/auth';
import QRCode from 'qrcode';

// QR image dapat di-fetch oleh SEMUA role yang terautentikasi (lihat QR_FEATURE_BRIEF).
// Pembatasan download/print ke OPERATOR ditangani di frontend.
export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { data: lot } = await supabase.from('finished_goods_lots')
    .select('id, lot_number, current_status, quantity, unit, product:products(name)')
    .eq('id', id)
    .single();
  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  const qrData = JSON.stringify({
    type: 'FINISHED_LOT',
    id: lot.id,
    lotNumber: lot.lot_number,
    product: lot.product?.name,
    qty: lot.quantity,
    unit: lot.unit,
    status: lot.current_status,
  });
  const buffer = await QRCode.toBuffer(qrData, {
    type: 'png',
    width: 400,
    margin: 2,
    color: { dark: '#1C1A14', light: '#FFFFFF' },
  });

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="QR-${lot.lot_number}.png"`,
    },
  });
}
