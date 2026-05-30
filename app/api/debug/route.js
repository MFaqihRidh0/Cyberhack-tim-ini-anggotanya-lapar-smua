import supabase from '@/lib/server/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const { data: users, error } = await supabase.from('users').select('id, email, role, is_active, password_hash').limit(5);
    
    if (error) {
      return Response.json({ error: error.message, hint: error.hint, code: error.code });
    }

    // Test bcrypt compare
    let bcryptTest = null;
    if (users && users.length > 0) {
      const testUser = users[0];
      bcryptTest = {
        email: testUser.email,
        hashPrefix: testUser.password_hash?.substring(0, 10),
        hashLength: testUser.password_hash?.length,
        compareResult: await bcrypt.compare('password123', testUser.password_hash || ''),
      };
    }

    return Response.json({ 
      userCount: users?.length || 0,
      users: users?.map(u => ({ id: u.id, email: u.email, role: u.role, is_active: u.is_active })),
      bcryptTest,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'hardcoded',
    });
  } catch (err) {
    return Response.json({ error: err.message });
  }
}
