import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  return Response.json({ success: true, data: products, message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'MANAGER')) return forbidden();

  const body = await request.json();
  const { name, code, category, unit, shelfLifeDays } = body;
  if (!name || !code || !category || !unit) {
    return Response.json({ success: false, data: null, message: 'name, code, category, unit wajib diisi' }, { status: 400 });
  }

  const product = await prisma.product.create({ data: { name, code, category, unit, shelfLifeDays } });
  return Response.json({ success: true, data: product, message: 'Product berhasil dibuat' }, { status: 201 });
}
