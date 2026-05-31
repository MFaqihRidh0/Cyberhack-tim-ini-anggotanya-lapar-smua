'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Send, ArrowLeft, User, Package, Globe, MapPin } from 'lucide-react';

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

export default function NewDispatchPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    finishedLotId: '', customerName: '', customerEmail: '', customerPhone: '',
    destination: 'LOCAL', country: '', quantity: '', unit: 'kg', trackingNumber: '', notes: '',
  });
  const [loading, setLoading] = useState(false);

  const { data: finishedLots } = useQuery({
    queryKey: ['finished-lots-for-dispatch'],
    queryFn: async () => {
      const [inWarehouse, partial] = await Promise.all([
        api.get('/finished-lots', { params: { status: 'IN_WAREHOUSE' } }).then((r) => r.data.data),
        api.get('/finished-lots', { params: { status: 'PARTIALLY_DISPATCHED' } }).then((r) => r.data.data),
      ]);
      return [...(inWarehouse || []), ...(partial || [])];
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.finishedLotId || !form.customerName || !form.quantity) { toast.error('Lot, Customer, and Quantity are required'); return; }
    if (form.destination === 'EXPORT' && !form.country) { toast.error('Country is required for EXPORT'); return; }
    setLoading(true);
    try {
      await api.post('/sample-dispatches', {
        ...form,
        quantity: Number(form.quantity),
        country: form.destination === 'EXPORT' ? form.country : null,
      });
      toast.success('Sample Dispatch created successfully');
      router.push('/dispatch');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create dispatch');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>
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
            <Send size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#1C1A14', lineHeight: 1.2 }}>New Sample Dispatch</h1>
            <p style={{ fontSize: 13, color: '#7D7A72', marginTop: 2 }}>Send a finished goods sample to a customer</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        {/* Finished Lot */}
        <SectionCard icon={Package} title="Finished Lot" color="linear-gradient(135deg,#F97316,#FFBC45)">
          <Field label="Finished Lot *">
            <select style={INPUT} value={form.finishedLotId} onChange={(e) => setForm({ ...form, finishedLotId: e.target.value })}>
              <option value="">Select Lot</option>
              {finishedLots?.map((l) => (
                <option key={l.id} value={l.id}>{l.lot_number} — {l.product?.name} ({l.quantity} {l.unit}) [{l.current_status}]</option>
              ))}
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Quantity *">
              <input style={INPUT} type="number" step="0.01" placeholder="e.g. 5" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </Field>
            <Field label="Unit">
              <input style={INPUT} type="text" placeholder="kg / liter / botol" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </Field>
          </div>
        </SectionCard>

        {/* Customer */}
        <SectionCard icon={User} title="Customer Information" color="linear-gradient(135deg,#6366F1,#8B5CF6)">
          <Field label="Customer Name *">
            <input style={INPUT} type="text" placeholder="PT Indofood Sukses Makmur" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Email">
              <input style={INPUT} type="email" placeholder="procurement@customer.com" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input style={INPUT} type="text" placeholder="021-5432-1234" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
            </Field>
          </div>
        </SectionCard>

        {/* Destination */}
        <SectionCard icon={form.destination === 'EXPORT' ? Globe : MapPin} title="Destination & Shipping" color="linear-gradient(135deg,#10B981,#34D399)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Destination">
              <div style={{ display: 'flex', gap: 8 }}>
                {['LOCAL', 'EXPORT'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm({ ...form, destination: opt })}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      border: form.destination === opt ? '2px solid #F97316' : '1px solid #ECEAE3',
                      background: form.destination === opt ? '#FFF3E0' : '#FAFAF8',
                      color: form.destination === opt ? '#C2580A' : '#7D7A72',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Field>
            {form.destination === 'EXPORT' && (
              <Field label="Country *">
                <input style={INPUT} type="text" placeholder="e.g. Singapore" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </Field>
            )}
          </div>
          <Field label="Tracking Number">
            <input style={INPUT} type="text" placeholder="JNE-2026050500001 (optional)" value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} />
          </Field>
          <Field label="Notes">
            <textarea style={{ ...INPUT, height: 72, resize: 'vertical' }} placeholder="Sample purpose, special handling notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
            {loading ? 'Sending...' : 'Send Sample Dispatch'}
          </button>
        </div>
      </form>
    </div>
  );
}
