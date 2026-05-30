'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import StatusBadge from '@/components/shared/StatusBadge';
import toast from 'react-hot-toast';

export default function QCPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('raw');
  const [inspecting, setInspecting] = useState(null);
  const [form, setForm] = useState({ colorScore: '', odorScore: '', textureScore: '', moistureLevel: '', result: '', notes: '' });

  const { data: rawLots } = useQuery({
    queryKey: ['raw-lots-qc-pending'],
    queryFn: () => api.get('/raw-lots', { params: { status: 'QC_PENDING' } }).then((r) => r.data.data),
  });

  const { data: finishedLots } = useQuery({
    queryKey: ['finished-lots-qc-pending'],
    queryFn: () => api.get('/finished-lots', { params: { status: 'QC_PENDING' } }).then((r) => r.data.data),
  });

  async function handleSubmitQC(e) {
    e.preventDefault();
    if (!form.result) { toast.error('Result wajib dipilih'); return; }

    const body = {
      ...(inspecting.type === 'raw' ? { rawLotId: inspecting.id } : { finishedLotId: inspecting.id }),
      result: form.result,
      colorScore: form.colorScore ? Number(form.colorScore) : null,
      odorScore: form.odorScore ? Number(form.odorScore) : null,
      textureScore: form.textureScore ? Number(form.textureScore) : null,
      moistureLevel: form.moistureLevel ? Number(form.moistureLevel) : null,
      notes: form.notes || null,
    };

    try {
      await api.post('/qc-inspections', body);
      toast.success('QC Inspection berhasil disimpan');
      setInspecting(null);
      setForm({ colorScore: '', odorScore: '', textureScore: '', moistureLevel: '', result: '', notes: '' });
      queryClient.invalidateQueries(['raw-lots-qc-pending']);
      queryClient.invalidateQueries(['finished-lots-qc-pending']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan QC');
    }
  }

  const lots = tab === 'raw' ? rawLots : finishedLots;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">QC Inspections</h1>

      <div className="flex gap-2">
        <button onClick={() => setTab('raw')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'raw' ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Bahan Baku</button>
        <button onClick={() => setTab('finished')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'finished' ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Produk Jadi</button>
      </div>

      {inspecting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Inspect: {inspecting.lotNumber}</h3>
            <form onSubmit={handleSubmitQC} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Color (1-10)</label>
                  <input type="number" min="1" max="10" value={form.colorScore} onChange={(e) => setForm({ ...form, colorScore: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Odor (1-10)</label>
                  <input type="number" min="1" max="10" value={form.odorScore} onChange={(e) => setForm({ ...form, odorScore: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Texture (1-10)</label>
                  <input type="number" min="1" max="10" value={form.textureScore} onChange={(e) => setForm({ ...form, textureScore: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Moisture (%)</label>
                  <input type="number" step="0.1" value={form.moistureLevel} onChange={(e) => setForm({ ...form, moistureLevel: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600">Result</label>
                <select value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                  <option value="">Pilih</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="ON_HOLD">ON HOLD</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium">Simpan</button>
                <button type="button" onClick={() => setInspecting(null)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium">Batal</button>
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
              <th className="text-left px-4 py-3 font-medium text-slate-600">{tab === 'raw' ? 'Material' : 'Product'}</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {lots?.map((lot) => (
              <tr key={lot.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{tab === 'raw' ? lot.internal_lot_no : lot.lot_number}</td>
                <td className="px-4 py-3 text-slate-600">{tab === 'raw' ? lot.material?.name : lot.product?.name}</td>
                <td className="px-4 py-3"><StatusBadge status={lot.current_status} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => setInspecting({ id: lot.id, type: tab, lotNumber: tab === 'raw' ? lot.internal_lot_no : lot.lot_number })} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg">Inspect</button>
                </td>
              </tr>
            ))}
            {lots?.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Tidak ada lot pending QC</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
