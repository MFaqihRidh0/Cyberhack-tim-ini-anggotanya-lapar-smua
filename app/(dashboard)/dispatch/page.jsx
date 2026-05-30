'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
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
      toast.success('Dispatch dikonfirmasi');
      queryClient.invalidateQueries(['sample-dispatches']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal konfirmasi');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Sample Dispatches</h1>
        <Link href="/dispatch/new" className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition">
          <Plus className="h-4 w-4" /> Kirim Sampel
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">No. Dispatch</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Lot</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Destination</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Tanggal</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Memuat...</td></tr>}
            {data?.map((d) => (
              <tr key={d.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{d.dispatchNumber}</td>
                <td className="px-4 py-3 text-slate-600">{d.customerName}</td>
                <td className="px-4 py-3 text-slate-600">{d.finishedLot?.lotNumber}</td>
                <td className="px-4 py-3 text-slate-600">{d.destination}{d.country ? ` (${d.country})` : ''}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(d.dispatchDate)}</td>
                <td className="px-4 py-3">
                  {d.receivedConfirmed ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Confirmed</span> : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pending</span>}
                </td>
                <td className="px-4 py-3">
                  {!d.receivedConfirmed && <button onClick={() => handleConfirm(d.id)} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg">Konfirmasi</button>}
                </td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Belum ada dispatch</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
