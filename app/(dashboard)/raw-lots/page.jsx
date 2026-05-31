'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/utils';
import { getUser } from '@/lib/auth';
import StatusBadge from '@/components/shared/StatusBadge';
import Link from 'next/link';
import toast from 'react-hot-toast';

const STATUSES = ['', 'RECEIVED', 'QC_PENDING', 'QC_APPROVED', 'QC_REJECTED', 'IN_QUEUE', 'IN_PRODUCTION', 'CONSUMED', 'ON_HOLD'];

export default function RawLotsPage() {
  const [status, setStatus] = useState('');
  const queryClient = useQueryClient();
  const user = getUser();

  const { data, isLoading } = useQuery({
    queryKey: ['raw-lots', status],
    queryFn: () => api.get('/raw-lots', { params: status ? { status } : {} }).then((r) => r.data.data),
  });

  async function handleSendToQC(lotId) {
    try {
      await api.patch(`/raw-lots/${lotId}/status`, { status: 'QC_PENDING', notes: 'Sent to QC for inspection' });
      toast.success('Lot sent to QC');
      queryClient.invalidateQueries(['raw-lots']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Raw Material Lots</h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 text-sm rounded-lg transition ${status === s ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Lot No.</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Material</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Supplier</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Qty</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Expiry</th>
              {user?.role === 'OPERATOR' && <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>}
            {data?.map((lot) => (
              <tr key={lot.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/raw-lots/${lot.id}`} className="font-medium text-blue-600 hover:underline">{lot.internal_lot_no}</Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{lot.material?.name}</td>
                <td className="px-4 py-3 text-slate-600">{lot.supplier?.name}</td>
                <td className="px-4 py-3 text-slate-600">{formatNumber(lot.initial_qty)} {lot.material?.unit}</td>
                <td className="px-4 py-3"><StatusBadge status={lot.current_status} /></td>
                <td className="px-4 py-3 text-slate-600">{formatDate(lot.expiry_date)}</td>
                {user?.role === 'OPERATOR' && (
                  <td className="px-4 py-3">
                    {lot.current_status === 'RECEIVED' && (
                      <button onClick={() => handleSendToQC(lot.id)} className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg font-medium">
                        Send to QC
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
