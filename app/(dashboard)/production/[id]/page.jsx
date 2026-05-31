'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/utils';
import { getUser } from '@/lib/auth';
import StatusBadge from '@/components/shared/StatusBadge';
import toast from 'react-hot-toast';

// Semua status yang relevan untuk Production Order
const PO_STATUSES = ['QUEUED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const STATUS_LABELS = {
  QUEUED:      'Queued',
  SCHEDULED:   'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  CANCELLED:   'Cancelled',
};

// Role yang berwenang mengubah status production order
const PO_AUTH_ROLES = ['PPIC', 'MANAGER'];

export default function ProductionDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const user = getUser();
  const [addingInput, setAddingInput] = useState(false);
  const [inputForm, setInputForm] = useState({ rawLotId: '', qtyUsed: '' });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [actualQty, setActualQty] = useState('');
  const [updating, setUpdating] = useState(false);

  const { data: po, isLoading } = useQuery({
    queryKey: ['production-order', id],
    queryFn: () => api.get(`/production-orders/${id}`).then((r) => r.data.data),
  });

  const { data: availableLots } = useQuery({
    queryKey: ['raw-lots-available'],
    queryFn: () => api.get('/raw-lots', { params: { status: 'QC_APPROVED' } }).then((r) => r.data.data),
    enabled: addingInput,
  });

  async function handleAddInput(e) {
    e.preventDefault();
    if (!inputForm.rawLotId || !inputForm.qtyUsed) { toast.error('Lot and Qty are required'); return; }
    try {
      const lot = availableLots?.find((l) => l.id === inputForm.rawLotId);
      await api.post(`/production-orders/${id}/inputs`, {
        rawLotId: inputForm.rawLotId,
        materialId: lot?.material_id,
        qtyUsed: Number(inputForm.qtyUsed),
      });
      toast.success('Raw material added');
      setAddingInput(false);
      setInputForm({ rawLotId: '', qtyUsed: '' });
      queryClient.invalidateQueries(['production-order', id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add input');
    }
  }

  async function handleUpdateStatus(value) {
    if (value === po.status) return;
    if (value === 'COMPLETED' && !actualQty) { toast.error('Actual Qty is required to complete'); return; }
    setUpdating(true);
    try {
      const body = { status: value };
      if (value === 'COMPLETED') body.actualQty = Number(actualQty);
      await api.patch(`/production-orders/${id}`, body);
      toast.success(`Status updated to ${STATUS_LABELS[value] || value}`);
      setSelectedStatus('');
      queryClient.invalidateQueries(['production-order', id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (!po) return <p className="text-slate-500">Production Order not found</p>;

  const canUpdate = PO_AUTH_ROLES.includes(user?.role);
  const statusValue = selectedStatus || po.status;
  const statusChanged = statusValue !== po.status;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{po.order_number}</h1>
          <p className="text-slate-500 mt-1">{po.product?.name} — Target: {formatNumber(po.target_qty)} {po.product?.unit}</p>
        </div>
        <StatusBadge status={po.status} />
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #ECEAE3', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#57544E', marginBottom: 6 }}>
            {canUpdate ? 'Update Status' : 'Current Status (read-only)'}
          </label>
          <select
            value={statusValue}
            disabled={!canUpdate || updating}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ECEAE3', fontSize: 14, color: '#1C1A14', backgroundColor: canUpdate ? '#FAFAF8' : '#F0EEE9', outline: 'none', fontFamily: 'inherit', cursor: canUpdate ? 'pointer' : 'not-allowed' }}
          >
            {PO_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
          </select>
        </div>
        {canUpdate && statusValue === 'COMPLETED' && (
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#57544E', marginBottom: 6 }}>Actual Qty *</label>
            <input
              type="number" step="0.01" placeholder={`e.g. ${po.target_qty}`}
              value={actualQty} onChange={(e) => setActualQty(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ECEAE3', fontSize: 14, color: '#1C1A14', backgroundColor: '#FAFAF8', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>
        )}
        {canUpdate && (
          <button
            onClick={() => handleUpdateStatus(statusValue)}
            disabled={!statusChanged || updating}
            style={{ padding: '10px 22px', borderRadius: 8, background: 'linear-gradient(135deg,#F97316,#FFBC45)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: statusChanged ? 'pointer' : 'not-allowed', opacity: (!statusChanged || updating) ? 0.5 : 1, whiteSpace: 'nowrap' }}
          >
            {updating ? 'Saving...' : 'Apply'}
          </button>
        )}
      </div>

      {po.actual_qty && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-sm text-slate-600">
          Actual Output: <strong>{formatNumber(po.actual_qty)} {po.product?.unit}</strong>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">Raw Materials Used</h3>
          {['QUEUED', 'SCHEDULED', 'IN_PROGRESS'].includes(po.status) && ['PPIC', 'MANAGER'].includes(user?.role) && (
            <button onClick={() => setAddingInput(true)} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg">+ Add</button>
          )}
        </div>

        {addingInput && (
          <form onSubmit={handleAddInput} className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
            <select value={inputForm.rawLotId} onChange={(e) => setInputForm({ ...inputForm, rawLotId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="">Select Raw Lot</option>
              {availableLots?.map((l) => <option key={l.id} value={l.id}>{l.internal_lot_no} — {l.material?.name} ({formatNumber(l.initial_qty)} {l.material?.unit})</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Qty Used" value={inputForm.qtyUsed} onChange={(e) => setInputForm({ ...inputForm, qtyUsed: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">Save</button>
              <button type="button" onClick={() => setAddingInput(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        )}

        <table className="w-full text-sm">
          <thead className="border-b border-slate-200">
            <tr>
              <th className="text-left py-2 text-slate-600">Lot</th>
              <th className="text-left py-2 text-slate-600">Material</th>
              <th className="text-left py-2 text-slate-600">Qty Used</th>
              <th className="text-left py-2 text-slate-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {po.inputs?.map((inp) => (
              <tr key={inp.id} className="border-b border-slate-100">
                <td className="py-2 text-slate-800">{inp.raw_lot?.internal_lot_no}</td>
                <td className="py-2 text-slate-600">{inp.material?.name}</td>
                <td className="py-2 text-slate-600">{formatNumber(inp.qty_used)}</td>
                <td className="py-2 text-slate-500">{formatDate(inp.used_at)}</td>
              </tr>
            ))}
            {(!po.inputs || po.inputs.length === 0) && <tr><td colSpan={4} className="py-4 text-center text-slate-500">No inputs yet</td></tr>}
          </tbody>
        </table>
      </div>

      {po.finishedLots?.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4">Finished Goods</h3>
          {po.finishedLots.map((fl) => (
            <div key={fl.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-800">{fl.lot_number}</span>
              <span className="text-sm text-slate-600">{formatNumber(fl.quantity)} {fl.unit}</span>
              <StatusBadge status={fl.current_status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
