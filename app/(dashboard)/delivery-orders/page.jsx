'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function DeliveryOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: () => api.get('/delivery-orders').then((r) => r.data.data),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Delivery Orders</h1>
        <Link href="/delivery-orders/new" className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition">
          <Plus className="h-4 w-4" /> Buat DO Baru
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">No. DO</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Supplier</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Tanggal</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Jumlah Lot</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Memuat...</td></tr>
            )}
            {data?.map((d) => (
              <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{d.doNumber}</td>
                <td className="px-4 py-3 text-slate-600">{d.supplier?.name}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(d.receivedDate)}</td>
                <td className="px-4 py-3 text-slate-600">{d._count?.rawLots ?? d.rawLots?.length ?? 0}</td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Belum ada Delivery Order</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
