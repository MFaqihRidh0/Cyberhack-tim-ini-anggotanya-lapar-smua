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
  Users,
  Boxes,
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
    <aside className="w-[220px] shrink-0 bg-sidebar-bg min-h-screen flex flex-col border-r border-sidebar-border">
      {/* Header */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Leaf className="h-7 w-7 text-primary-500" />
          <span className="font-display text-2xl text-sidebar-active-text leading-none">
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
              className={cn(
                'flex items-center gap-3 mx-2 my-0.5 px-4 py-2.5 rounded-lg text-sm font-medium border-l-[3px] transition-colors',
                active
                  ? 'bg-sidebar-active-bg text-sidebar-active-text border-primary-500'
                  : 'text-sidebar-text border-transparent hover:bg-white/5'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — user */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-active-bg">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white text-sm font-semibold">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-text">{user?.name || 'User'}</p>
            <p className="truncate text-xs text-sidebar-muted">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
