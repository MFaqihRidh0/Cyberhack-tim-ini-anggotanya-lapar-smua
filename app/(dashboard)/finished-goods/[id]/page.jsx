'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/utils';
import { getUser } from '@/lib/auth';
import StatusBadge from '@/components/shared/StatusBadge';
import LotTimeline from '@/components/lots/LotTimeline';
import QRDisplay from '@/components/lots/QRDisplay';
import toast from 'react-hot-toast';

export default function FinishedGoodDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const user = getUser();
  const [warehouseForm, setWarehouseForm] = useState({ zone: '', position: '' });

  const { data: lot, isLoading } = useQuery({
    queryKey: ['finished-lot', id],
    queryFn: () => api.get(`/finished-lots/${id}`).then((r) => r.data.data),
  });

  async function handleWarehouse(e) {
    e.preventDefault();
    if (!warehouseForm.zone || !warehouseForm.position) { toast.error('Zone and Position are required'); return; }
    try {
      await api.patch(`/finished-lots/${id}/warehouse`, { warehouseZone: warehouseForm.zone, warehousePosition: warehouseForm.position });
      toast.success('Warehouse position updated');
      queryClient.invalidateQueries(['finished-lot', id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (!lot) return <p className="text-slate-500">Lot not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{lot.lot_number}</h1>
          <p className="text-slate-500 mt-1">{lot.product?.name} — {formatNumber(lot.quantity)} {lot.unit}</p>
        </div>
        <StatusBadge status={lot.current_status} />
      </div>

      {['OPERATOR', 'MANAGER'].includes(user?.role) && ['PRODUCED', 'QC_APPROVED'].includes(lot.current_status) && (
        <form onSubmit={handleWarehouse} className="bg-white p-4 rounded-xl border border-slate-200 flex items-end gap-3">
          <div className="flex-1">
            <label className="text-sm text-slate-600">Zone</label>
            <input type="text" value={warehouseForm.zone} onChange={(e) => setWarehouseForm({ ...warehouseForm, zone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="A1" />
          </div>
          <div className="flex-1">
            <label className="text-sm text-slate-600">Position</label>
            <input type="text" value={warehouseForm.position} onChange={(e) => setWarehouseForm({ ...warehouseForm, position: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Rak-01" />
          </div>
          <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm">Set Location</button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4">Status History</h3>
          <LotTimeline stages={lot.stages} />
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center">
          <h3 className="font-semibold text-slate-700 mb-4">QR Code</h3>
          <QRDisplay lotId={lot.id} lotType="finished" lotNumber={lot.lot_number} />
        </div>
      </div>

      {lot.sampleDispatches?.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4">Sample Dispatches</h3>
          <div className="space-y-2">
            {lot.sampleDispatches.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="font-medium text-slate-800">{d.dispatch_number}</span>
                  <span className="ml-3 text-sm text-slate-600">{d.customer_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{d.destination}</span>
                  {d.received_confirmed ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Confirmed</span> : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
