'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const STATUSES = ['', 'QUEUED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function ProductionPage() {
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['production-orders', status],
    queryFn: () => api.get('/production-orders', { params: status ? { status } : {} }).then((r) => r.data.data),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Production Orders</h1>
        <Link href="/production/new" className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition">
          <Plus className="h-4 w-4" /> Buat PO Baru
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 text-sm rounded-lg transition ${status === s ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s || 'Semua'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Order No.</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Target Qty</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Priority</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Memuat...</td></tr>}
            {data?.map((po) => (
              <tr key={po.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/production/${po.id}`} className="font-medium text-blue-600 hover:underline">{po.orderNumber}</Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{po.product?.name}</td>
                <td className="px-4 py-3 text-slate-600">{formatNumber(po.targetQty)}</td>
                <td className="px-4 py-3 text-slate-600">{po.priority}</td>
                <td className="px-4 py-3"><StatusBadge status={po.status} /></td>
                <td className="px-4 py-3 text-slate-600">{formatDate(po.scheduledDate)}</td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Tidak ada data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
