'use client';

import { cn, STATUS_COLORS } from '@/lib/utils';

export default function StatusBadge({ status }) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', colorClass)}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
