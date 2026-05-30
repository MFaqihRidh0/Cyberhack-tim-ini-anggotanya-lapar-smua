'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';

export default function Navbar({ user }) {
  return (
    <header
      className="flex items-center justify-between px-8"
      style={{
        height: '56px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #ECEAE3',
        boxShadow: '0 1px 2px rgba(22,20,14,0.03)',
      }}
    >
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: '#7D7A72' }}
      >
        <span style={{ fontWeight: 500, color: '#3D3B36' }}>Sima Arome</span>
        <span style={{ color: '#D6D3C8' }}>/</span>
        <span>Manufacturing System</span>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        style={{ color: '#57544E' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#991B1B';
          e.currentTarget.style.backgroundColor = '#FEF2F2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#57544E';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  );
}
