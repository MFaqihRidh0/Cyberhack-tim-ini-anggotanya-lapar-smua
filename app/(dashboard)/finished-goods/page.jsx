'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { getUser } from '@/lib/auth';
import StatusBadge from '@/components/shared/StatusBadge';
import Link from 'next/link';
import toast from 'react-hot-toast';

const STATUSES = ['', 'PRODUCED', 'QC_PENDING', 'QC_APPROVED', 'IN_WAREHOUSE', 'PARTIALLY_DISPATCHED', 'FULLY_DISPATCHED'];

export default function FinishedGoodsPage() {
  const [status, setStatus] = useState('');
  const user = getUser();
  const queryClient = useQueryClient();
  const [warehouseModal, setWarehouseModal] = useState(null);
  const [zone, setZone] = useState('');
  const [position, setPosition] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['finished-lots', status],
    queryFn: () => api.get('/finished-lots', { params: status ? { status } : {} }).then((r) => r.data.data),
  });

  async function handleSendToQC(lotId) {
    try {
      await api.patch(`/finished-lots/${lotId}/status`, { status: 'QC_PENDING', notes: 'Sent to QC for inspection' });
      toast.success('Sent to QC');
      queryClient.invalidateQueries(['finished-lots']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  }

  async function handleMoveToWarehouse(e) {
    e.preventDefault();
    if (!zone || !position) { toast.error('Zone and Position required'); return; }
    try {
      await api.patch(`/finished-lots/${warehouseModal}/warehouse`, { warehouseZone: zone, warehousePosition: position });
      toast.success('Moved to warehouse');
      setWarehouseModal(null);
      setZone('');
      setPosition('');
      queryClient.invalidateQueries(['finished-lots']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  }

  function getAction(lot) {
    // PPIC/Manager: Send PRODUCED → QC
    if (lot.current_status === 'PRODUCED' && ['PPIC', 'MANAGER'].includes(user?.role)) {
      return <button onClick={() => handleSendToQC(lot.id)} className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg font-medium">Send to QC</button>;
    }
    // Operator: Move QC_APPROVED → IN_WAREHOUSE
    if (lot.current_status === 'QC_APPROVED' && ['OPERATOR', 'MANAGER'].includes(user?.role)) {
      return <button onClick={() => setWarehouseModal(lot.id)} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg font-medium">Move to Warehouse</button>;
    }
    return null;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Finished Goods</h1>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 text-sm rounded-lg transition ${status === s ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Warehouse Modal */}
      {warehouseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Set Warehouse Location</h3>
            <form onSubmit={handleMoveToWarehouse} className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Zone</label>
                <input type="text" value={zone} onChange={(e) => setZone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g. A1, B2" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Position</label>
                <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g. Rack-01, Shelf-3" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium">Confirm</button>
                <button type="button" onClick={() => { setWarehouseModal(null); setZone(''); setPosition(''); }} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Lot No.</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Qty</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Warehouse</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>}
            {data?.map((lot) => (
              <tr key={lot.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3"><Link href={`/finished-goods/${lot.id}`} className="font-medium text-blue-600 hover:underline">{lot.lot_number}</Link></td>
                <td className="px-4 py-3 text-slate-600">{lot.product?.name}</td>
                <td className="px-4 py-3 text-slate-600">{formatNumber(lot.quantity)} {lot.unit}</td>
                <td className="px-4 py-3 text-slate-600">{lot.warehouse_zone ? `${lot.warehouse_zone} / ${lot.warehouse_position}` : '-'}</td>
                <td className="px-4 py-3"><StatusBadge status={lot.current_status} /></td>
                <td className="px-4 py-3">{getAction(lot)}</td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
