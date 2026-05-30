'use client';

import { LogOut, Menu, Leaf } from 'lucide-react';
import { logout } from '@/lib/auth';

export default function Navbar({ user, onToggleSidebar = () => {} }) {
  return (
    <header
      className="flex items-center justify-between px-6"
      style={{
        height: '70px',
        background:
          'linear-gradient(90deg, rgba(249,115,22,0.14) 0%, rgba(255,188,69,0.08) 100%)',
        borderBottom: '1px solid rgba(249, 115, 22, 0.22)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 2px 12px rgba(154, 63, 7, 0.06)',
      }}
    >
      {/* Kiri — burger + logo + breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label="Buka menu"
          className="flex items-center justify-center rounded-lg transition-colors"
          style={{ width: '40px', height: '40px', color: '#C2580A', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(194, 88, 10, 0.16)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F97316, #FFBC45)',
              boxShadow: '0 3px 10px rgba(249, 115, 22, 0.4)',
            }}
          >
            <Leaf size={22} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '24px',
              color: '#9A3F07',
              lineHeight: 1,
            }}
          >
            SimaTrack
          </span>
        </div>

        {/* Divider + breadcrumb (sembunyi di layar kecil) */}
        <div className="hidden md:flex items-center gap-3">
          <span style={{ width: '1px', height: '24px', backgroundColor: 'rgba(154,63,7,0.2)' }} />
          <span className="text-sm" style={{ color: '#7D7A72', fontWeight: 500 }}>
            Manufacturing System
          </span>
        </div>
      </div>

      {/* Kanan — user + logout */}
      <div className="flex items-center gap-3">
        {user?.name && (
          <span className="hidden sm:block text-sm" style={{ color: '#57544E' }}>
            Hai, <span style={{ fontWeight: 600, color: '#3D3B36' }}>{user.name}</span>
          </span>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            color: '#C2580A',
            backgroundColor: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(194, 88, 10, 0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.backgroundColor = '#C2580A';
            e.currentTarget.style.borderColor = '#C2580A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#C2580A';
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.55)';
            e.currentTarget.style.borderColor = 'rgba(194, 88, 10, 0.25)';
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
