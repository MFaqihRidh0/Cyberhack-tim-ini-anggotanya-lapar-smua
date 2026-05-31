import jwt from 'jsonwebtoken';
import supabase from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'aMHFKZ0jocHoSGPs4HHcUAvINCuErQFWl5wxGxFyj1ZFmKJlpLuRqaBof0RxqUi8';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export async function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('id', decoded.id)
      .single();

    if (!user || user.is_active === false) return null;
    return user;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return Response.json(
    { success: false, data: null, message: 'Token tidak valid atau expired' },
    { status: 401 }
  );
}

export function forbidden(msg = 'Akses ditolak') {
  return Response.json(
    { success: false, data: null, message: msg },
    { status: 403 }
  );
}

export function checkRole(user, ...roles) {
  return roles.includes(user.role);
}
