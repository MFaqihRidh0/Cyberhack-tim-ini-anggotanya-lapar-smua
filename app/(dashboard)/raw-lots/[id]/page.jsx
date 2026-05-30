'use client';

import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/utils';
import { getUser } from '@/lib/auth';
import StatusBadge from '@/components/shared/StatusBadge';
import LotTimeline from '@/components/lots/LotTimeline';
import QRDisplay from '@/components/lots/QRDisplay';
import toast from 'react-hot-toast';

export default function RawLotDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const user = getUser();

  const { data: lot, isLoading } = useQuery({
    queryKey: ['raw-lot', id],
    queryFn: () => api.get(`/raw-lots/${id}`).then((r) => r.data.data),
  });

  async function handleStatusUpdate(newStatus) {
    try {
      await api.patch(`/raw-lots/${id}/status`, { status: newStatus, notes: `Status diubah ke ${newStatus}` });
      toast.success(`Status diubah ke ${newStatus}`);
      queryClient.invalidateQueries(['raw-lot', id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal update status');
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  }

  if (!lot) return <p className="text-slate-500">Lot tidak ditemukan</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{lot.internal_lot_no}</h1>
          <p className="text-slate-500 mt-1">{lot.material?.name} — {lot.supplier?.name}</p>
        </div>
        <StatusBadge status={lot.current_status} />
      </div>

      {/* Status Action Buttons */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 flex-wrap">
        {lot.current_status === 'INCOMING' && ['OPERATOR', 'MANAGER'].includes(user?.role) && (
          <button onClick={() => handleStatusUpdate('QC_PENDING')} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg">→ Kirim ke QC</button>
        )}
        {lot.current_status === 'QC_APPROVED' && ['PPIC', 'MANAGER'].includes(user?.role) && (
          <button onClick={() => handleStatusUpdate('IN_QUEUE')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg">→ Masuk Antrian</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Qty Awal</p>
          <p className="text-xl font-bold text-slate-800">{formatNumber(lot.initial_qty)} {lot.material?.unit}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Remaining Qty</p>
          <p className="text-xl font-bold text-orange-600">{formatNumber(lot.remainingQty)} {lot.material?.unit}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Expiry Date</p>
          <p className="text-xl font-bold text-slate-800">{formatDate(lot.expiry_date)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4">Riwayat Status</h3>
          <LotTimeline stages={lot.stages} />
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center">
          <h3 className="font-semibold text-slate-700 mb-4">QR Code</h3>
          <QRDisplay lotId={lot.id} lotType="raw" lotNumber={lot.internal_lot_no} />
        </div>
      </div>

      {lot.qcInspections?.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4">QC Inspections</h3>
          <div className="space-y-3">
            {lot.qcInspections.map((qc) => (
              <div key={qc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <StatusBadge status={`QC_${qc.result}`} />
                  <span className="ml-3 text-sm text-slate-600">
                    Color: {qc.color_score || '-'} | Odor: {qc.odor_score || '-'} | Texture: {qc.texture_score || '-'}
                  </span>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{qc.inspected_by?.name}</p>
                  <p>{formatDate(qc.inspected_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
