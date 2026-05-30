'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';

export default function Navbar({ user }) {
  return (
    <header className="h-14 bg-[var(--card-bg)] border-b border-[var(--card-border)] flex items-center justify-between px-8 shadow-[0_1px_2px_rgba(22,20,14,0.03)]">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <span className="font-medium text-neutral-700">Sima Arome</span>
        <span className="text-neutral-300">/</span>
        <span>Manufacturing System</span>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] rounded-md transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  );
}
