'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewDeliveryOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState({ doNumber: '', supplierId: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.get('/suppliers').then((r) => r.data.data),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.doNumber || !form.supplierId) {
      toast.error('No. DO dan Supplier wajib diisi');
      return;
    }
    setLoading(true);
    try {
      await api.post('/delivery-orders', form);
      toast.success('Delivery Order berhasil dibuat');
      router.push('/delivery-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat DO');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Buat Delivery Order Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">No. DO</label>
          <input type="text" value={form.doNumber} onChange={(e) => setForm({ ...form, doNumber: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="DO-2026-001" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
          <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
            <option value="">Pilih Supplier</option>
            {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" rows={3} />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition disabled:opacity-50">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
}
