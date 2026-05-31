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

// Semua status yang relevan untuk Raw Material Lot
const RAW_STATUSES = ['INCOMING', 'QC_PENDING', 'QC_APPROVED', 'QC_REJECTED', 'IN_QUEUE', 'IN_PRODUCTION', 'CONSUMED', 'ON_HOLD'];

const STATUS_LABELS_RAW = {
  INCOMING: 'Incoming', QC_PENDING: 'QC Pending', QC_APPROVED: 'QC Approved', QC_REJECTED: 'QC Rejected',
  IN_QUEUE: 'In Queue', IN_PRODUCTION: 'In Production', CONSUMED: 'Consumed', ON_HOLD: 'On Hold',
};

// Role yang berwenang mengubah status raw lot
const RAW_AUTH_ROLES = ['OPERATOR', 'QC_STAFF', 'PPIC', 'MANAGER'];

export default function RawLotDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const user = getUser();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const { data: lot, isLoading } = useQuery({
    queryKey: ['raw-lot', id],
    queryFn: () => api.get(`/raw-lots/${id}`).then((r) => r.data.data),
  });

  async function handleStatusUpdate() {
    if (!selectedStatus) { toast.error('Please select a status'); return; }
    setUpdating(true);
    try {
      await api.patch(`/raw-lots/${id}/status`, { status: selectedStatus });
      toast.success(`Status updated to ${STATUS_LABELS_RAW[selectedStatus] || selectedStatus}`);
      setSelectedStatus('');
      queryClient.invalidateQueries(['raw-lot', id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  }

  if (!lot) return <p className="text-slate-500">Lot not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{lot.internal_lot_no}</h1>
          <p className="text-slate-500 mt-1">{lot.material?.name} — {lot.supplier?.name}</p>
        </div>
        <StatusBadge status={lot.current_status} />
      </div>

      {/* Status Dropdown */}
      {(() => {
        const canUpdate = RAW_AUTH_ROLES.includes(user?.role);
        const value = selectedStatus || lot.current_status;
        const changed = value !== lot.current_status;
        return (
          <div style={{ backgroundColor: '#fff', border: '1px solid #ECEAE3', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#57544E', marginBottom: 6 }}>
                {canUpdate ? 'Update Status' : 'Current Status (read-only)'}
              </label>
              <select
                value={value}
                disabled={!canUpdate || updating}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ECEAE3', fontSize: 14, color: '#1C1A14', backgroundColor: canUpdate ? '#FAFAF8' : '#F0EEE9', outline: 'none', fontFamily: 'inherit', cursor: canUpdate ? 'pointer' : 'not-allowed' }}
              >
                {RAW_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS_RAW[s] || s}</option>)}
              </select>
            </div>
            {canUpdate && (
              <button
                onClick={handleStatusUpdate}
                disabled={!changed || updating}
                style={{ padding: '10px 22px', borderRadius: 8, background: 'linear-gradient(135deg,#F97316,#FFBC45)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: changed ? 'pointer' : 'not-allowed', opacity: (!changed || updating) ? 0.5 : 1, whiteSpace: 'nowrap' }}
              >
                {updating ? 'Saving...' : 'Apply'}
              </button>
            )}
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Initial Qty</p>
          <p className="text-xl font-bold text-slate-800">{formatNumber(lot.initial_qty)} {lot.material?.unit}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Remaining Qty</p>
          <p className="text-xl font-bold text-orange-600">{formatNumber(lot.remainingQty)} {lot.material?.unit}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Expiry Date</p>
          <p className="text-xl font-bold text-slate-800">{formatDate(lot.expiry_date)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4">Status History</h3>
          <LotTimeline stages={lot.stages} />
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center">
          <h3 className="font-semibold text-slate-700 mb-4">QR Code</h3>
          <QRDisplay lotId={lot.id} lotType="raw" lotNumber={lot.internal_lot_no} />
        </div>
      </div>

      {lot.qcInspections?.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4">QC Inspections</h3>
          <div className="space-y-3">
            {lot.qcInspections.map((qc) => (
              <div key={qc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <StatusBadge status={`QC_${qc.result}`} />
                  <span className="ml-3 text-sm text-slate-600">
                    Color: {qc.color_score || '-'} | Odor: {qc.odor_score || '-'} | Texture: {qc.texture_score || '-'}
                  </span>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{qc.inspected_by?.name}</p>
                  <p>{formatDate(qc.inspected_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
