'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

/**
 * Inline status dropdown untuk tabel daftar.
 * Mengubah status langsung dari list tanpa masuk halaman detail.
 *
 * Props:
 *  - current       : status saat ini (string)
 *  - statuses      : daftar semua status yang tersedia (array)
 *  - labels        : map { STATUS: 'Label' }
 *  - canUpdate     : boolean — apakah role berwenang mengubah
 *  - endpoint      : URL PATCH, mis. `/raw-lots/abc/status`
 *  - invalidateKey : query key untuk di-refetch setelah update
 */
export default function StatusSelect({ current, statuses, labels = {}, canUpdate, endpoint, invalidateKey }) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    const next = e.target.value;
    if (next === value) return;
    const prev = value;
    setValue(next);
    setSaving(true);
    try {
      await api.patch(endpoint, { status: next });
      toast.success(`Status updated to ${labels[next] || next}`);
      queryClient.invalidateQueries(invalidateKey);
    } catch (err) {
      setValue(prev); // rollback kalau gagal
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  // Pastikan status saat ini selalu jadi opsi (walau tidak ada di daftar transisi)
  const options = statuses.includes(value) ? statuses : [value, ...statuses];

  return (
    <select
      value={value}
      disabled={!canUpdate || saving}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      style={{
        padding: '6px 10px',
        borderRadius: 8,
        border: '1px solid #ECEAE3',
        fontSize: 13,
        color: '#1C1A14',
        backgroundColor: canUpdate ? '#FAFAF8' : '#F0EEE9',
        outline: 'none',
        fontFamily: 'inherit',
        cursor: canUpdate ? 'pointer' : 'not-allowed',
        opacity: saving ? 0.6 : 1,
        maxWidth: 200,
      }}
    >
      {options.map((s) => (
        <option key={s} value={s}>{labels[s] || s}</option>
      ))}
    </select>
  );
}
