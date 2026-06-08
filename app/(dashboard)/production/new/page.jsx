'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Factory, ArrowLeft, Boxes, CalendarDays, ListOrdered } from 'lucide-react';

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

function SectionCard({ icon: Icon, title, color, children }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #ECEAE3', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #F5F4F0', display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#FAFAF8' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color="#fff" />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#3D3B36' }}>{title}</span>
      </div>
      <div style={{ padding: '20px', display: 'grid', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

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
    if (!form.productId || !form.targetQty) { toast.error('Product and Target Qty are required'); return; }
    setLoading(true);
    try {
      const res = await api.post('/production-orders', {
        productId: form.productId,
        targetQty: Number(form.targetQty),
        scheduledDate: form.scheduledDate || null,
        priority: Number(form.priority),
        notes: form.notes || null,
      });
      toast.success('Production Order created successfully');
      router.push(`/production/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create production order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
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
            <Factory size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#1C1A14', lineHeight: 1.2 }}>New Production Order</h1>
            <p style={{ fontSize: 13, color: '#7D7A72', marginTop: 2 }}>Schedule a new production run for a finished product</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <SectionCard icon={Boxes} title="Product" color="linear-gradient(135deg,#F97316,#FFBC45)">
          <Field label="Product *">
            <select style={INPUT} value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              <option value="">Select Product</option>
              {products?.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
            </select>
          </Field>
          <Field label="Target Quantity *">
            <input style={INPUT} type="number" step="0.01" placeholder="e.g. 100" value={form.targetQty} onChange={(e) => setForm({ ...form, targetQty: e.target.value })} />
          </Field>
        </SectionCard>

        <SectionCard icon={CalendarDays} title="Schedule & Priority" color="linear-gradient(135deg,#6366F1,#8B5CF6)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Scheduled Date">
              <input style={INPUT} type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
            </Field>
            <Field label="Priority">
              <select style={INPUT} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="0">Normal (0)</option>
                <option value="1">Low (1)</option>
                <option value="2">Medium (2)</option>
                <option value="3">High (3)</option>
                <option value="5">Urgent (5)</option>
              </select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard icon={ListOrdered} title="Notes" color="linear-gradient(135deg,#10B981,#34D399)">
          <Field label="Notes (optional)">
            <textarea style={{ ...INPUT, height: 88, resize: 'vertical' }} placeholder="Production remarks, special instructions..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </SectionCard>

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
            {loading ? 'Saving...' : 'Create Production Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
