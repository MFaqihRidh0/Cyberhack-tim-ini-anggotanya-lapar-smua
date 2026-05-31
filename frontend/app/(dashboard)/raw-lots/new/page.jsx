'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Package, ArrowLeft, FlaskConical, Truck, CalendarDays, StickyNote } from 'lucide-react';

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
            <Package size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#1C1A14', lineHeight: 1.2 }}>Receive Raw Material</h1>
            <p style={{ fontSize: 13, color: '#7D7A72', marginTop: 2 }}>Register incoming raw material lot into the system</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <SectionCard icon={Truck} title="Supplier & Material" color="linear-gradient(135deg,#F97316,#FFBC45)">
          <Field label="Supplier *">
            <select style={INPUT} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">Select Supplier</option>
              {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </Field>
          <Field label="Material *">
            <select style={INPUT} value={form.materialId} onChange={(e) => setForm({ ...form, materialId: e.target.value })}>
              <option value="">Select Material</option>
              {materials?.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code}) — {m.unit}</option>)}
            </select>
          </Field>
        </SectionCard>

        <SectionCard icon={FlaskConical} title="Lot Details" color="linear-gradient(135deg,#6366F1,#8B5CF6)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Quantity *">
              <input style={INPUT} type="number" step="0.01" placeholder="100" value={form.initialQty} onChange={(e) => setForm({ ...form, initialQty: e.target.value })} />
            </Field>
            <Field label="Supplier Lot No. (optional)">
              <input style={INPUT} type="text" placeholder="From delivery note" value={form.supplierLotNo} onChange={(e) => setForm({ ...form, supplierLotNo: e.target.value })} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard icon={CalendarDays} title="Dates & Notes" color="linear-gradient(135deg,#10B981,#34D399)">
          <Field label="Expiry Date (optional)">
            <input style={INPUT} type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </Field>
          <Field label="Notes">
            <textarea style={{ ...INPUT, height: 80, resize: 'vertical' }} placeholder="Additional remarks..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
            {loading ? 'Saving...' : 'Save Raw Material Lot'}
          </button>
        </div>
      </form>
    </div>
  );
}
