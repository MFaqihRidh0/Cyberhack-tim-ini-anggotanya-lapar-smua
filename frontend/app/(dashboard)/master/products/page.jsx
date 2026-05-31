'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Boxes, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CARD = { backgroundColor: '#FFFFFF', border: '1px solid #ECEAE3', borderRadius: '14px', overflow: 'hidden' };
const TH = { textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#7D7A72', backgroundColor: '#FAFAF8', borderBottom: '1px solid #ECEAE3' };
const TD = { padding: '14px 16px', fontSize: '14px', color: '#3D3B36', borderBottom: '1px solid #F5F4F0' };
const INPUT = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ECEAE3', fontSize: 14, color: '#1C1A14', backgroundColor: '#FAFAF8', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

const CATEGORIES = ['Ekstrak Cair', 'Bubuk', 'Pasta', 'Konsentrat'];
const UNITS = ['liter', 'kg', 'gram', 'botol', 'drum'];
const EMPTY_FORM = { code: '', name: '', category: '', unit: '', shelf_life_days: '' };

const CATEGORY_COLORS = {
  'Ekstrak Cair': { bg: '#E8F5E9', color: '#2E7D32' },
  'Bubuk':        { bg: '#FFF3E0', color: '#E65100' },
  'Pasta':        { bg: '#F3E5F5', color: '#6A1B9A' },
  'Konsentrat':   { bg: '#E3F2FD', color: '#0D47A1' },
};

export default function ProductsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products').then((r) => r.data.data),
  });

  const create = useMutation({
    mutationFn: (body) => api.post('/products', body),
    onSuccess: () => {
      toast.success('Product added successfully');
      qc.invalidateQueries({ queryKey: ['products'] });
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.category || !form.unit) return toast.error('Code, name, category, and unit are required');
    create.mutate({ ...form, shelf_life_days: form.shelf_life_days ? parseInt(form.shelf_life_days) : null });
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#FFBC45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Boxes size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#1C1A14', lineHeight: 1.2 }}>Products</h1>
            <p style={{ fontSize: 13, color: '#7D7A72', marginTop: 2 }}>Finished products manufactured by Sima Arome</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
          style={{ padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#FFBC45)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(249,115,22,0.35)' }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div style={CARD}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH}>Code</th>
              <th style={TH}>Product Name</th>
              <th style={TH}>Category</th>
              <th style={TH}>Unit</th>
              <th style={TH}>Shelf Life</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} style={{ ...TD, textAlign: 'center', color: '#A8A49A' }}>Loading...</td></tr>
            )}
            {data?.map((p) => {
              const cat = CATEGORY_COLORS[p.category] || { bg: '#F5F4F0', color: '#57544E' };
              return (
                <tr key={p.id}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAFAF8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={TD}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, background: '#F5F4F0', padding: '3px 8px', borderRadius: 6 }}>{p.code}</span>
                  </td>
                  <td style={{ ...TD, fontWeight: 600 }}>{p.name}</td>
                  <td style={TD}>
                    <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, backgroundColor: cat.bg, color: cat.color, fontWeight: 500 }}>{p.category}</span>
                  </td>
                  <td style={{ ...TD, color: '#57544E' }}>{p.unit}</td>
                  <td style={{ ...TD, color: '#57544E' }}>{p.shelf_life_days ? `${p.shelf_life_days} days` : '-'}</td>
                </tr>
              );
            })}
            {data?.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center' }}>
                <Boxes size={32} color="#D6D3C8" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#A8A49A', fontSize: 14 }}>No products yet</p>
                <p style={{ color: '#C4C1BA', fontSize: 12, marginTop: 4 }}>Click &ldquo;+ Add Product&rdquo; to add the first entry</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Add New Product" onClose={() => { setShowModal(false); setForm(EMPTY_FORM); }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <Field label="Code *">
                  <input style={INPUT} placeholder="PRD-EVN-001" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                </Field>
                <Field label="Product Name *">
                  <input style={INPUT} placeholder="Vanilla Extract 10x" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Field label="Category *">
                  <select style={INPUT} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select...</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Unit *">
                  <select style={INPUT} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    <option value="">Select...</option>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </Field>
                <Field label="Shelf Life (days)">
                  <input style={INPUT} type="number" placeholder="365" value={form.shelf_life_days} onChange={(e) => setForm({ ...form, shelf_life_days: e.target.value })} />
                </Field>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ECEAE3', background: '#fff', color: '#57544E', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={create.isPending} style={{ padding: '10px 22px', borderRadius: 8, background: 'linear-gradient(135deg,#F97316,#FFBC45)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: create.isPending ? 0.7 : 1 }}>
                {create.isPending ? 'Saving...' : 'Save Product'}
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
      <div style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #ECEAE3' }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1C1A14' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A49A', padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}
