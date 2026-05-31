'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DispatchPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['sample-dispatches'],
    queryFn: () => api.get('/sample-dispatches').then((r) => r.data.data),
  });

  async function handleConfirm(id) {
    try {
      await api.patch(`/sample-dispatches/${id}/confirm`);
      toast.success('Dispatch confirmed');
      queryClient.invalidateQueries(['sample-dispatches']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Sample Dispatches</h1>
        <Link href="/dispatch/new" className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition">
          <Plus className="h-4 w-4" /> Send Sample
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Dispatch No.</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Lot ID</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Destination</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>}
            {data?.map((d) => (
              <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/dispatch/${d.id}`} className="font-medium text-blue-600 hover:underline">{d.dispatch_number}</Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{d.customer_name}</td>
                <td className="px-4 py-3 text-slate-600">{d.finished_lot?.lot_number || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{d.finished_lot?.product?.name || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{d.destination}{d.country ? ` (${d.country})` : ''}</td>
                <td className="px-4 py-3 text-slate-600">{formatDateTime(d.dispatch_date)}</td>
                <td className="px-4 py-3">
                  {d.received_confirmed
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Confirmed {formatDateTime(d.received_at)}</span>
                    : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pending since {formatDateTime(d.dispatch_date)}</span>}
                </td>
                <td className="px-4 py-3">
                  {!d.received_confirmed && <button onClick={() => handleConfirm(d.id)} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg">Confirm</button>}
                </td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No dispatches yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
