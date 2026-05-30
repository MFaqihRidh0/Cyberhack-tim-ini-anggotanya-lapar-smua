'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

export default function NewDeliveryOrderPage() {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ materialId: '', qty: '', supplierLotNo: '', expiryDate: '' }]);
  const [loading, setLoading] = useState(false);

  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: () => api.get('/suppliers').then((r) => r.data.data) });
  const { data: materials } = useQuery({ queryKey: ['materials'], queryFn: () => api.get('/materials').then((r) => r.data.data) });

  function addItem() {
    setItems([...items, { materialId: '', qty: '', supplierLotNo: '', expiryDate: '' }]);
  }

  function removeItem(index) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!supplierId) { toast.error('Please select a supplier'); return; }
    const validItems = items.filter((i) => i.materialId && i.qty);
    if (validItems.length === 0) { toast.error('At least 1 item with material and qty required'); return; }

    setLoading(true);
    try {
      await api.post('/delivery-orders', { supplierId, notes, items: validItems });
      toast.success('Delivery Order created successfully');
      router.push('/delivery-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create DO');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Receive New Delivery Order</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <p className="text-sm text-slate-500">DO number will be auto-generated (format: DO-YYYYMMDD-XXX)</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
              <option value="">Select Supplier</option>
              {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" rows={2} placeholder="Delivery note remarks, etc." />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Material List</h3>
            <button type="button" onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg">
              <Plus className="h-4 w-4" /> Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Item #{i + 1}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500">Material</label>
                    <select value={item.materialId} onChange={(e) => updateItem(i, 'materialId', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                      <option value="">Select Material</option>
                      {materials?.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code}) — {m.unit}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Quantity</label>
                    <input type="number" step="0.01" value={item.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="100" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Supplier Lot No.</label>
                    <input type="text" value={item.supplierLotNo} onChange={(e) => updateItem(i, 'supplierLotNo', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Optional" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500">Expiry Date</label>
                    <input type="date" value={item.expiryDate} onChange={(e) => updateItem(i, 'expiryDate', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition disabled:opacity-50">
          {loading ? 'Saving...' : `Save DO (${items.filter(i => i.materialId && i.qty).length} item)`}
        </button>
      </form>
    </div>
  );
}
