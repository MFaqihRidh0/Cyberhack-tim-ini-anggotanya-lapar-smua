import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized } from '@/lib/server/auth';
import QRCode from 'qrcode';

// QR image dapat di-fetch oleh SEMUA role yang terautentikasi (lihat QR_FEATURE_BRIEF).
// Pembatasan download/print ke OPERATOR ditangani di frontend.
export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { data: lot } = await supabase.from('raw_material_lots')
    .select('id, internal_lot_no, current_status, initial_qty, material:materials(name, unit), supplier:suppliers(name)')
    .eq('id', id)
    .single();

  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  const qrData = JSON.stringify({
    type: 'RAW_LOT',
    id: lot.id,
    lotNumber: lot.internal_lot_no,
    material: lot.material?.name,
    supplier: lot.supplier?.name,
    qty: lot.initial_qty,
    unit: lot.material?.unit,
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
      'Content-Disposition': `inline; filename="QR-${lot.internal_lot_no}.png"`,
    },
  });
}
