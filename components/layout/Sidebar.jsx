'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Package,
  FlaskConical,
  Factory,
  Warehouse,
  Send,
  QrCode,
  Leaf,
  Building2,
  Sprout,
  Boxes,
} from 'lucide-react';

const COMMON_MENU = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scan', label: 'Scan QR', icon: QrCode },
];

const ROLE_MENU = {
  OPERATOR: [
    { section: 'Daily Operations' },
    { href: '/delivery-orders', label: 'Delivery Orders', icon: Truck },
    { href: '/raw-lots', label: 'Raw Materials', icon: Package },
    { href: '/finished-goods', label: 'Finished Goods', icon: Warehouse },
  ],

  QC_STAFF: [
    { section: 'Quality Control' },
    { href: '/qc', label: 'QC Inspections', icon: FlaskConical },
    { href: '/raw-lots', label: 'Raw Materials', icon: Package },
    { href: '/finished-goods', label: 'Finished Goods', icon: Warehouse },
  ],

  PPIC: [
    { section: 'Production Planning' },
    { href: '/production', label: 'Production Orders', icon: Factory },
    { href: '/raw-lots', label: 'Raw Materials', icon: Package },
    { href: '/finished-goods', label: 'Finished Goods', icon: Warehouse },
  ],

  MANAGER: [
    { section: 'Operations' },
    { href: '/delivery-orders', label: 'Delivery Orders', icon: Truck },
    { href: '/raw-lots', label: 'Raw Materials', icon: Package },
    { href: '/qc', label: 'QC Inspections', icon: FlaskConical },
    { href: '/production', label: 'Production Orders', icon: Factory },
    { href: '/finished-goods', label: 'Finished Goods', icon: Warehouse },
    { href: '/dispatch', label: 'Sample Dispatch', icon: Send },

    { section: 'Master Data' },
    { href: '/master/suppliers', label: 'Suppliers', icon: Building2 },
    { href: '/master/materials', label: 'Materials', icon: Sprout },
    { href: '/master/products', label: 'Products', icon: Boxes },
  ],
};

function getInitials(name) {
  if (!name) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function NavItem({ item, Icon, active, onClose }) {
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className="flex items-center gap-3 mx-2 my-0.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
      style={{
        backgroundColor: active ? '#2E2B22' : 'transparent',
        color: active ? '#FFA012' : '#E8E4D9',
        borderLeft: active ? '3px solid #F97316' : '3px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {item.label}
    </Link>
  );
}

export default function Sidebar({ user, open = false, onClose = () => {} }) {
  const pathname = usePathname();
  const role = user?.role || 'OPERATOR';
  const roleItems = ROLE_MENU[role] ?? ROLE_MENU.OPERATOR;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(22, 20, 14, 0.45)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 40,
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transition: 'opacity 0.25s ease, visibility 0.25s ease',
        }}
      />

      <aside
        className="flex flex-col"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '280px',
          backgroundColor: '#1C1A14',
          borderRight: '1px solid #2E2B22',
          zIndex: 50,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: open ? '4px 0 32px rgba(0,0,0,0.35)' : 'none',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="px-5 py-6" style={{ borderBottom: '1px solid #2E2B22' }}>
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
            <Leaf className="h-7 w-7" style={{ color: '#F97316' }} />
            <span
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '22px',
                color: '#FFA012',
                lineHeight: 1,
              }}
            >
              SimaTrack
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3">
          {/* Common items — semua role */}
          {COMMON_MENU.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return <NavItem key={item.href} item={item} Icon={Icon} active={active} onClose={onClose} />;
          })}

          {/* Role-specific items dengan section headers */}
          {roleItems.map((item, idx) => {
            if (item.section) {
              return (
                <div
                  key={`section-${idx}`}
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.3)',
                    padding: '16px 20px 6px',
                    marginTop: idx === 0 ? '4px' : '8px',
                  }}
                >
                  {item.section}
                </div>
              );
            }
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return <NavItem key={`${item.href}-${idx}`} item={item} Icon={Icon} active={active} onClose={onClose} />;
          })}
        </nav>

        {/* Credit */}
        <div style={{ padding: '8px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em', lineHeight: 1.6 }}>
            tim ini anggotanya lapar smua<br />
            <span style={{ color: 'rgba(249,115,22,0.4)' }}>CyberHack 2026</span>
          </p>
        </div>

        {/* Footer — user */}
        <div className="p-3" style={{ borderTop: '1px solid #2E2B22' }}>
          <div
            className="flex items-center gap-3 px-2 py-2 rounded-lg"
            style={{ backgroundColor: '#2E2B22' }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-semibold"
              style={{ backgroundColor: '#F97316' }}
            >
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" style={{ color: '#E8E4D9' }}>
                {user?.name || 'User'}
              </p>
              <p className="truncate text-xs" style={{ color: '#8A8479' }}>
                {role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
