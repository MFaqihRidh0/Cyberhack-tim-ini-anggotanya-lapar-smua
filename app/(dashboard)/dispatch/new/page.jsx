'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewDispatchPage() {
  const router = useRouter();
  const [form, setForm] = useState({ finishedLotId: '', customerName: '', customerEmail: '', customerPhone: '', destination: 'LOCAL', country: '', quantity: '', unit: 'kg', trackingNumber: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const { data: finishedLots } = useQuery({
    queryKey: ['finished-lots-for-dispatch'],
    queryFn: () => api.get('/finished-lots', { params: { status: 'IN_WAREHOUSE' } }).then((r) => r.data.data),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.finishedLotId || !form.customerName || !form.quantity) { toast.error('Lot, Customer, dan Quantity wajib diisi'); return; }
    if (form.destination === 'EXPORT' && !form.country) { toast.error('Country wajib diisi untuk EXPORT'); return; }
    setLoading(true);
    try {
      await api.post('/sample-dispatches', {
        ...form,
        quantity: Number(form.quantity),
        country: form.destination === 'EXPORT' ? form.country : null,
      });
      toast.success('Sample Dispatch berhasil dibuat');
      router.push('/dispatch');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat dispatch');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Kirim Sampel Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Finished Lot</label>
          <select value={form.finishedLotId} onChange={(e) => setForm({ ...form, finishedLotId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
            <option value="">Pilih Lot</option>
            {finishedLots?.map((l) => <option key={l.id} value={l.id}>{l.lot_number} — {l.product?.name} ({l.quantity} {l.unit})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
          <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input type="text" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
            <select value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="LOCAL">LOCAL</option>
              <option value="EXPORT">EXPORT</option>
            </select>
          </div>
          {form.destination === 'EXPORT' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
            <input type="text" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tracking Number</label>
          <input type="text" value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2} />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition disabled:opacity-50">
          {loading ? 'Menyimpan...' : 'Kirim Sampel'}
        </button>
      </form>
    </div>
  );
}
