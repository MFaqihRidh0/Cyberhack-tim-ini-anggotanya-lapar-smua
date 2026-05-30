import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized } from '@/lib/server/auth';
import QRCode from 'qrcode';

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const lot = await prisma.finishedGoodsLot.findUnique({ where: { id }, include: { product: { select: { name: true } } } });
  if (!lot) return Response.json({ success: false, data: null, message: 'Lot tidak ditemukan' }, { status: 404 });

  const qrData = JSON.stringify({ type: 'FINISHED_LOT', id: lot.id, lotNumber: lot.lotNumber, product: lot.product.name, status: lot.currentStatus });
  const buffer = await QRCode.toBuffer(qrData, { type: 'png', width: 300, margin: 2 });

  return new Response(buffer, { headers: { 'Content-Type': 'image/png' } });
}
