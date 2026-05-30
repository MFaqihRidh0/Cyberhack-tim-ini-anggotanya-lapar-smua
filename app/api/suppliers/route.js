import prisma from '@/lib/server/prisma';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const suppliers = await prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  return Response.json({ success: true, data: suppliers, message: 'Berhasil' });
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'MANAGER')) return forbidden();

  const body = await request.json();
  const { name, code, contactName, phone, email, address } = body;
  if (!name || !code) {
    return Response.json({ success: false, data: null, message: 'name dan code wajib diisi' }, { status: 400 });
  }

  const supplier = await prisma.supplier.create({ data: { name, code, contactName, phone, email, address } });
  return Response.json({ success: true, data: supplier, message: 'Supplier berhasil dibuat' }, { status: 201 });
}
