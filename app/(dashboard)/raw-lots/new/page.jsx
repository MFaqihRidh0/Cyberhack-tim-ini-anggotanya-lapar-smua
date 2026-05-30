'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewRawLotPage() {
  const router = useRouter();
  const [form, setForm] = useState({ supplierId: '', materialId: '', initialQty: '', supplierLotNo: '', expiryDate: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: () => api.get('/suppliers').then((r) => r.data.data) });
  const { data: materials } = useQuery({ queryKey: ['materials'], queryFn: () => api.get('/materials').then((r) => r.data.data) });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.supplierId || !form.materialId || !form.initialQty) {
      toast.error('Supplier, Material, and Qty are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/raw-lots', form);
      toast.success('Raw Material Lot created successfully');
      router.push('/raw-lots');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lot');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Receive Raw Material Lot</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
          <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
            <option value="">Select Supplier</option>
            {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Material</label>
          <select value={form.materialId} onChange={(e) => setForm({ ...form, materialId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
            <option value="">Select Material</option>
            {materials?.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code}) — {m.unit}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
          <input type="number" step="0.01" value={form.initialQty} onChange={(e) => setForm({ ...form, initialQty: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Lot No. (optional)</label>
          <input type="text" value={form.supplierLotNo} onChange={(e) => setForm({ ...form, supplierLotNo: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="From delivery note" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date (optional)</label>
          <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" rows={2} />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition disabled:opacity-50">
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
