'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Building2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CARD = { backgroundColor: '#FFFFFF', border: '1px solid #ECEAE3', borderRadius: '14px', overflow: 'hidden' };
const TH = { textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#7D7A72', backgroundColor: '#FAFAF8', borderBottom: '1px solid #ECEAE3' };
const TD = { padding: '14px 16px', fontSize: '14px', color: '#3D3B36', borderBottom: '1px solid #F5F4F0' };

const EMPTY_FORM = { code: '', name: '', contact_name: '', phone: '', email: '', address: '' };

export default function SuppliersPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.get('/suppliers').then((r) => r.data.data),
  });

  const create = useMutation({
    mutationFn: (body) => api.post('/suppliers', body),
    onSuccess: () => {
      toast.success('Supplier added successfully');
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code || !form.name) return toast.error('Code and name are required');
    create.mutate(form);
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#FFBC45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#1C1A14', lineHeight: 1.2 }}>Suppliers</h1>
            <p style={{ fontSize: 13, color: '#7D7A72', marginTop: 2 }}>Supplier list for Sima Arome raw materials</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
          style={{ padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#FFBC45)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(249,115,22,0.35)' }}
        >
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      <div style={CARD}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH}>Code</th>
              <th style={TH}>Supplier Name</th>
              <th style={TH}>Contact</th>
              <th style={TH}>Phone</th>
              <th style={TH}>Email</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} style={{ ...TD, textAlign: 'center', color: '#A8A49A' }}>Loading...</td></tr>
            )}
            {data?.map((s) => (
              <tr key={s.id}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAFAF8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={TD}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: '#F5F4F0', padding: '3px 8px', borderRadius: 6 }}>{s.code}</span>
                </td>
                <td style={{ ...TD, fontWeight: 600 }}>{s.name}</td>
                <td style={{ ...TD, color: '#57544E' }}>{s.contact_name || '-'}</td>
                <td style={{ ...TD, color: '#57544E' }}>{s.phone || '-'}</td>
                <td style={{ ...TD, color: '#57544E' }}>{s.email || '-'}</td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center' }}>
                <Building2 size={32} color="#D6D3C8" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#A8A49A', fontSize: 14 }}>No suppliers yet</p>
                <p style={{ color: '#C4C1BA', fontSize: 12, marginTop: 4 }}>Click &ldquo;+ Add Supplier&rdquo; to add the first entry</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Add New Supplier" onClose={() => { setShowModal(false); setForm(EMPTY_FORM); }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <Field label="Supplier Code *">
                  <input style={INPUT} placeholder="SUP-001" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                </Field>
                <Field label="Supplier Name *">
                  <input style={INPUT} placeholder="PT Rempah Nusantara" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Contact Name">
                  <input style={INPUT} placeholder="Pak Budi" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <input style={INPUT} placeholder="0812-3456-7890" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
              </div>
              <Field label="Email">
                <input style={INPUT} type="email" placeholder="contact@supplier.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Address">
                <textarea style={{ ...INPUT, height: 80, resize: 'vertical' }} placeholder="Full supplier address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ECEAE3', background: '#fff', color: '#57544E', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={create.isPending} style={{ padding: '10px 22px', borderRadius: 8, background: 'linear-gradient(135deg,#F97316,#FFBC45)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: create.isPending ? 0.7 : 1 }}>
                {create.isPending ? 'Saving...' : 'Save Supplier'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#57544E', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,20,14,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #ECEAE3' }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1C1A14' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A49A', padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

const INPUT = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ECEAE3', fontSize: 14, color: '#1C1A14', backgroundColor: '#FAFAF8', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
