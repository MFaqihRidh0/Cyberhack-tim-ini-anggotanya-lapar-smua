import bcrypt from 'bcryptjs';
import prisma from '@/lib/server/prisma';
import { signToken } from '@/lib/server/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return Response.json({ success: false, data: null, message: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return Response.json({ success: false, data: null, message: 'Email atau password salah' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return Response.json({ success: false, data: null, message: 'Email atau password salah' }, { status: 401 });
    }

    const token = signToken(user);
    const { passwordHash, ...userData } = user;

    return Response.json({ success: true, data: { token, user: userData }, message: 'Login berhasil' });
  } catch (err) {
    return Response.json({ success: false, data: null, message: err.message }, { status: 500 });
  }
}
