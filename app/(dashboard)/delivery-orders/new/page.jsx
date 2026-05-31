'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Truck, ArrowLeft, Package, StickyNote } from 'lucide-react';

const INPUT = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ECEAE3', fontSize: 14, color: '#1C1A14', backgroundColor: '#FAFAF8', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const LABEL = { display: 'block', fontSize: 12, fontWeight: 600, color: '#57544E', marginBottom: 6 };

function Field({ label, children }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  );
}

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

  const validCount = items.filter((i) => i.materialId && i.qty).length;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#7D7A72', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 16 }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#F97316,#FFBC45)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
            <Truck size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#1C1A14', lineHeight: 1.2 }}>New Delivery Order</h1>
            <p style={{ fontSize: 13, color: '#7D7A72', marginTop: 2 }}>DO number will be auto-generated (format: DO-YYYYMMDD-XXX)</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        {/* Supplier & Notes */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #ECEAE3', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F5F4F0', display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#FAFAF8' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#F97316,#FFBC45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={15} color="#fff" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#3D3B36' }}>Supplier Information</span>
          </div>
          <div style={{ padding: '20px', display: 'grid', gap: 14 }}>
            <Field label="Supplier *">
              <select style={INPUT} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Select Supplier</option>
                {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </Field>
            <Field label="Notes">
              <textarea style={{ ...INPUT, height: 72, resize: 'vertical' }} placeholder="Delivery note remarks, batch info, etc." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Material Items */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #ECEAE3', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F5F4F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAF8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={15} color="#fff" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#3D3B36' }}>Material List</span>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, backgroundColor: '#FFF3E0', color: '#C2580A', fontWeight: 600 }}>{items.length} item{items.length > 1 ? 's' : ''}</span>
            </div>
            <button
              type="button"
              onClick={addItem}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'linear-gradient(135deg,#F97316,#FFBC45)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          <div style={{ padding: '16px 20px', display: 'grid', gap: 12 }}>
            {items.map((item, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: '#FAFAF8', borderRadius: 10, border: '1px solid #F0EDE6', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#F97316', letterSpacing: '0.05em' }}>ITEM #{i + 1}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <Field label="Material *">
                    <select style={INPUT} value={item.materialId} onChange={(e) => updateItem(i, 'materialId', e.target.value)}>
                      <option value="">Select Material</option>
                      {materials?.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code}) — {m.unit}</option>)}
                    </select>
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field label="Quantity *">
                      <input style={INPUT} type="number" step="0.01" placeholder="100" value={item.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)} />
                    </Field>
                    <Field label="Supplier Lot No.">
                      <input style={INPUT} type="text" placeholder="Optional" value={item.supplierLotNo} onChange={(e) => updateItem(i, 'supplierLotNo', e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Expiry Date">
                    <input style={INPUT} type="date" value={item.expiryDate} onChange={(e) => updateItem(i, 'expiryDate', e.target.value)} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #ECEAE3', background: '#fff', color: '#57544E', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#FFBC45)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 2px 8px rgba(249,115,22,0.35)' }}
          >
            {loading ? 'Saving...' : `Save DO (${validCount} item${validCount !== 1 ? 's' : ''})`}
          </button>
        </div>
      </form>
    </div>
  );
}
