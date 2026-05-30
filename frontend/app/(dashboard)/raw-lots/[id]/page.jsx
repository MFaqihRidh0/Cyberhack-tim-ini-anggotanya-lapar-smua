'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import LotTimeline from '@/components/lots/LotTimeline';
import QRDisplay from '@/components/lots/QRDisplay';

export default function RawLotDetailPage() {
  const { id } = useParams();

  const { data: lot, isLoading } = useQuery({
    queryKey: ['raw-lot', id],
    queryFn: () => api.get(`/raw-lots/${id}`).then((r) => r.data.data),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  }

  if (!lot) {
    return <p className="text-slate-500">Lot tidak ditemukan</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{lot.internalLotNo}</h1>
          <p className="text-slate-500 mt-1">{lot.material?.name} — {lot.supplier?.name}</p>
        </div>
        <StatusBadge status={lot.currentStatus} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Qty Awal</p>
          <p className="text-xl font-bold text-slate-800">{formatNumber(lot.initialQty)} {lot.material?.unit}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Remaining Qty</p>
          <p className="text-xl font-bold text-orange-600">{formatNumber(lot.remainingQty)} {lot.material?.unit}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Expiry Date</p>
          <p className="text-xl font-bold text-slate-800">{formatDate(lot.expiryDate)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4">Riwayat Status</h3>
          <LotTimeline stages={lot.stages} />
        </div>

        {/* QR Code */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center">
          <h3 className="font-semibold text-slate-700 mb-4">QR Code</h3>
          <QRDisplay lotId={lot.id} lotType="raw" lotNumber={lot.internalLotNo} />
        </div>
      </div>

      {/* QC Inspections */}
      {lot.qcInspections?.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4">QC Inspections</h3>
          <div className="space-y-3">
            {lot.qcInspections.map((qc) => (
              <div key={qc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <StatusBadge status={`QC_${qc.result}`} />
                  <span className="ml-3 text-sm text-slate-600">
                    Color: {qc.colorScore} | Odor: {qc.odorScore} | Texture: {qc.textureScore}
                  </span>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{qc.inspectedBy?.name}</p>
                  <p>{formatDate(qc.inspectedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
