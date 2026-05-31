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
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RawLotDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const user = getUser();

  const { data: lot, isLoading } = useQuery({
    queryKey: ['raw-lot', id],
    queryFn: () => api.get(`/raw-lots/${id}`).then((r) => r.data.data),
  });

  async function handleSendToQC() {
    try {
      await api.patch(`/raw-lots/${id}/status`, { status: 'QC_PENDING', notes: 'Sent to QC for inspection' });
      toast.success('Lot sent to QC');
      queryClient.invalidateQueries(['raw-lot', id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  }

  if (!lot) return <p className="text-slate-500">Lot not found</p>;

  return (
    <div className="space-y-6">
      <Link href="/raw-lots" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to Raw Lots
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{lot.internal_lot_no}</h1>
          <p className="text-slate-500 mt-1">{lot.material?.name} — {lot.supplier?.name}</p>
        </div>
        <StatusBadge status={lot.current_status} />
      </div>

      {/* Operator action: Send to QC */}
      {user?.role === 'OPERATOR' && lot.current_status === 'RECEIVED' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-700">Send to Quality Control</p>
            <p className="text-sm text-slate-500">Submit this lot for QC inspection</p>
          </div>
          <button onClick={handleSendToQC} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg">
            Send to QC
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Initial Qty</p>
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
          <h3 className="font-semibold text-slate-700 mb-4">Status History</h3>
          <LotTimeline stages={lot.stages} />
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center">
          <h3 className="font-semibold text-slate-700 mb-4">QR Code</h3>
          <QRDisplay lotId={lot.id} lotType="raw-lots" lotNumber={lot.internal_lot_no} canDownload={['OPERATOR', 'MANAGER'].includes(user?.role)} />
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
