'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewProductionOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState({ productId: '', targetQty: '', scheduledDate: '', priority: '0', notes: '' });
  const [loading, setLoading] = useState(false);

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products').then((r) => r.data.data),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.productId || !form.targetQty) { toast.error('Product dan Target Qty wajib diisi'); return; }
    setLoading(true);
    try {
      const res = await api.post('/production-orders', {
        productId: form.productId,
        targetQty: Number(form.targetQty),
        scheduledDate: form.scheduledDate || null,
        priority: Number(form.priority),
        notes: form.notes || null,
      });
      toast.success('Production Order berhasil dibuat');
      router.push(`/production/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat PO');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Buat Production Order Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
          <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
            <option value="">Pilih Product</option>
            {products?.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Qty</label>
          <input type="number" step="0.01" value={form.targetQty} onChange={(e) => setForm({ ...form, targetQty: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
          <input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority (0 = normal)</label>
          <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={3} />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition disabled:opacity-50">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
}
