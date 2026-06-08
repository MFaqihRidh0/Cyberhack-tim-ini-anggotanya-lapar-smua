'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeliveryOrdersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: () => api.get('/delivery-orders').then((r) => r.data.data),
  });

  async function handleReceive(id) {
    try {
      const res = await api.patch(`/delivery-orders/${id}/receive`);
      toast.success(res.data.message);
      queryClient.invalidateQueries(['delivery-orders']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to receive');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Delivery Orders</h1>
        <Link href="/delivery-orders/new" className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition">
          <Plus className="h-4 w-4" /> New DO
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">No. DO</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Supplier</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Ordered</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Received</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            )}
            {data?.map((d) => (
              <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/delivery-orders/${d.id}`} className="font-medium text-blue-600 hover:underline">{d.do_number}</Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{d.supplier?.name}</td>
                <td className="px-4 py-3 text-slate-600">{formatDateTime(d.ordered_at)}</td>
                <td className="px-4 py-3 text-slate-600">{d.status === 'RECEIVED' ? formatDateTime(d.received_date) : '-'}</td>
                <td className="px-4 py-3">
                  {d.status === 'RECEIVED'
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">RECEIVED</span>
                    : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">INCOMING</span>}
                </td>
                <td className="px-4 py-3">
                  {d.status !== 'RECEIVED' && (
                    <button onClick={() => handleReceive(d.id)} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-medium">
                      ✓ Receive
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No Delivery Orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
