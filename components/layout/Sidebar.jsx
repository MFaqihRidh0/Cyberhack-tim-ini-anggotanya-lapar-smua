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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ALL_MENU = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OPERATOR', 'QC_STAFF', 'PPIC', 'MANAGER'] },
  { href: '/delivery-orders', label: 'Delivery Orders', icon: Truck, roles: ['OPERATOR', 'MANAGER'] },
  { href: '/raw-lots', label: 'Raw Lots', icon: Package, roles: ['OPERATOR', 'QC_STAFF', 'PPIC', 'MANAGER'] },
  { href: '/qc', label: 'QC Inspections', icon: FlaskConical, roles: ['QC_STAFF', 'MANAGER'] },
  { href: '/production', label: 'Production', icon: Factory, roles: ['PPIC', 'MANAGER'] },
  { href: '/finished-goods', label: 'Finished Goods', icon: Warehouse, roles: ['OPERATOR', 'QC_STAFF', 'PPIC', 'MANAGER'] },
  { href: '/dispatch', label: 'Dispatch', icon: Send, roles: ['MANAGER'] },
  { href: '/scan', label: 'Scan QR', icon: QrCode, roles: ['OPERATOR', 'QC_STAFF', 'PPIC', 'MANAGER'] },
];

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

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const role = user?.role || 'OPERATOR';
  const menu = ALL_MENU.filter((item) => item.roles.includes(role));

  return (
    <aside
      className="w-[220px] shrink-0 min-h-screen flex flex-col"
      style={{ backgroundColor: '#1C1A14', borderRight: '1px solid #2E2B22' }}
    >
      {/* Header */}
      <div className="px-5 py-6" style={{ borderBottom: '1px solid #2E2B22' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
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
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
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
        })}
      </nav>

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
  );
}
