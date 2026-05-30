'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import toast from 'react-hot-toast';

export default function ProductionDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [addingInput, setAddingInput] = useState(false);
  const [inputForm, setInputForm] = useState({ rawLotId: '', qtyUsed: '' });
  const [actualQty, setActualQty] = useState('');

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
    if (!inputForm.rawLotId || !inputForm.qtyUsed) { toast.error('Lot dan Qty wajib diisi'); return; }
    try {
      const lot = availableLots?.find((l) => l.id === inputForm.rawLotId);
      await api.post(`/production-orders/${id}/inputs`, {
        rawLotId: inputForm.rawLotId,
        materialId: lot?.material_id,
        qtyUsed: Number(inputForm.qtyUsed),
      });
      toast.success('Bahan baku ditambahkan');
      setAddingInput(false);
      setInputForm({ rawLotId: '', qtyUsed: '' });
      queryClient.invalidateQueries(['production-order', id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambah input');
    }
  }

  async function handleUpdateStatus(newStatus) {
    try {
      const body = { status: newStatus };
      if (newStatus === 'COMPLETED') {
        if (!actualQty) { toast.error('Actual Qty wajib diisi untuk complete'); return; }
        body.actualQty = Number(actualQty);
      }
      await api.patch(`/production-orders/${id}`, body);
      toast.success(`Status diubah ke ${newStatus}`);
      queryClient.invalidateQueries(['production-order', id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal update status');
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (!po) return <p className="text-slate-500">Production Order tidak ditemukan</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{po.order_number}</h1>
          <p className="text-slate-500 mt-1">{po.product?.name} — Target: {formatNumber(po.target_qty)} {po.product?.unit}</p>
        </div>
        <StatusBadge status={po.status} />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 flex-wrap">
        {po.status === 'QUEUED' && <button onClick={() => handleUpdateStatus('SCHEDULED')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg">→ SCHEDULED</button>}
        {po.status === 'SCHEDULED' && <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg">→ IN PROGRESS</button>}
        {po.status === 'IN_PROGRESS' && (
          <div className="flex items-center gap-2">
            <input type="number" step="0.01" placeholder="Actual Qty" value={actualQty} onChange={(e) => setActualQty(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg w-32" />
            <button onClick={() => handleUpdateStatus('COMPLETED')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg">→ COMPLETED</button>
          </div>
        )}
        {po.actual_qty && <span className="text-sm text-slate-600">Actual: {formatNumber(po.actual_qty)} {po.product?.unit}</span>}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">Bahan Baku Dipakai</h3>
          {['QUEUED', 'SCHEDULED', 'IN_PROGRESS'].includes(po.status) && (
            <button onClick={() => setAddingInput(true)} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg">+ Tambah</button>
          )}
        </div>

        {addingInput && (
          <form onSubmit={handleAddInput} className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
            <select value={inputForm.rawLotId} onChange={(e) => setInputForm({ ...inputForm, rawLotId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="">Pilih Raw Lot</option>
              {availableLots?.map((l) => <option key={l.id} value={l.id}>{l.internal_lot_no} — {l.material?.name} ({formatNumber(l.initial_qty)} {l.material?.unit})</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Qty Used" value={inputForm.qtyUsed} onChange={(e) => setInputForm({ ...inputForm, qtyUsed: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">Simpan</button>
              <button type="button" onClick={() => setAddingInput(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm">Batal</button>
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
            {(!po.inputs || po.inputs.length === 0) && <tr><td colSpan={4} className="py-4 text-center text-slate-500">Belum ada input</td></tr>}
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
