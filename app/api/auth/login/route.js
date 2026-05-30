import bcrypt from 'bcryptjs';
import supabase from '@/lib/server/db';
import { signToken } from '@/lib/server/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return Response.json({ success: false, data: null, message: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user || !user.is_active) {
      return Response.json({ success: false, data: null, message: 'Email atau password salah' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return Response.json({ success: false, data: null, message: 'Email atau password salah' }, { status: 401 });
    }

    const token = signToken(user);
    const { password_hash, ...userData } = user;

    return Response.json({ success: true, data: { token, user: userData }, message: 'Login berhasil' });
  } catch (err) {
    return Response.json({ success: false, data: null, message: err.message }, { status: 500 });
  }
}
