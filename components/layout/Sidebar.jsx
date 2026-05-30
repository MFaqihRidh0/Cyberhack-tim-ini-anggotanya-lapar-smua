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

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const role = user?.role || 'OPERATOR';

  const menu = ALL_MENU.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-orange-500" />
          <span className="text-xl font-bold text-slate-800">SimaTrack</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                active
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-slate-700">{user?.name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
    </aside>
  );
}
