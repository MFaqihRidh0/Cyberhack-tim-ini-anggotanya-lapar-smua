'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';

export default function Navbar({ user }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Selamat datang, {user?.name || 'User'}
        </h2>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  );
}
