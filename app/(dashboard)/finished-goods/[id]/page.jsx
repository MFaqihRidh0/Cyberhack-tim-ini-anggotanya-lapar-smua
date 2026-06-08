'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { getUser } from '@/lib/auth';
import StatusBadge from '@/components/shared/StatusBadge';
import LotTimeline from '@/components/lots/LotTimeline';
import QRDisplay from '@/components/lots/QRDisplay';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const FG_STATUSES = ['PRODUCED', 'QC_PENDING', 'QC_APPROVED', 'QC_REJECTED', 'IN_WAREHOUSE', 'PARTIALLY_DISPATCHED', 'FULLY_DISPATCHED', 'ON_HOLD'];
const STATUS_LABELS_FG = {
  PRODUCED: 'Produced', QC_PENDING: 'QC Pending', QC_APPROVED: 'QC Approved', QC_REJECTED: 'QC Rejected',
  IN_WAREHOUSE: 'In Warehouse', PARTIALLY_DISPATCHED: 'Partially Dispatched', FULLY_DISPATCHED: 'Fully Dispatched', ON_HOLD: 'On Hold',
};

export default function FinishedGoodDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const user = getUser();
  const [warehouseForm, setWarehouseForm] = useState({ zone: '', position: '' });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);

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

  async function handleStatusUpdate() {
    if (!selectedStatus || selectedStatus === lot.current_status) return;
    setUpdating(true);
    try {
      await api.patch(`/finished-lots/${id}/status`, { status: selectedStatus });
      toast.success(`Status updated to ${STATUS_LABELS_FG[selectedStatus]}`);
      setSelectedStatus('');
      queryClient.invalidateQueries(['finished-lot', id]);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setUpdating(false); }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (!lot) return <p className="text-slate-500">Lot not found</p>;

  const isManager = user?.role === 'MANAGER';
  const statusValue = selectedStatus || lot.current_status;
  const statusChanged = statusValue !== lot.current_status;

  return (
    <div className="space-y-6">
      <Link href="/finished-goods" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to Finished Goods
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{lot.lot_number}</h1>
          <p className="text-slate-500 mt-1">{lot.product?.name} — {formatNumber(lot.quantity)} {lot.unit}</p>
        </div>
        <StatusBadge status={lot.current_status} />
      </div>

      {/* Status Update — MANAGER ONLY */}
      {isManager && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #ECEAE3', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#57544E', marginBottom: 6 }}>Update Status (Manager)</label>
            <select
              value={statusValue}
              disabled={updating}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ECEAE3', fontSize: 14, color: '#1C1A14', backgroundColor: '#FAFAF8', outline: 'none', fontFamily: 'inherit' }}
            >
              {FG_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS_FG[s] || s}</option>)}
            </select>
          </div>
          <button
            onClick={handleStatusUpdate}
            disabled={!statusChanged || updating}
            style={{ padding: '10px 22px', borderRadius: 8, background: 'linear-gradient(135deg,#F97316,#FFBC45)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: statusChanged ? 'pointer' : 'not-allowed', opacity: (!statusChanged || updating) ? 0.5 : 1, whiteSpace: 'nowrap' }}
          >
            {updating ? 'Saving...' : 'Apply'}
          </button>
        </div>
      )}

      {/* Warehouse Location — Operator/Manager for QC_APPROVED lots */}
      {['OPERATOR', 'MANAGER'].includes(user?.role) && ['PRODUCED', 'QC_APPROVED', 'IN_WAREHOUSE'].includes(lot.current_status) && (
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
          <QRDisplay lotId={lot.id} lotType="finished-lots" lotNumber={lot.lot_number} canPrintDownload={['OPERATOR', 'MANAGER'].includes(user?.role)} />
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
                  <span className="ml-3 text-sm text-slate-600">{d.customer_name} — {formatNumber(d.quantity)} {d.unit}</span>
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
