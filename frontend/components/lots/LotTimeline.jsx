'use client';

import { formatDateTime } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';

export default function LotTimeline({ stages }) {
  if (!stages || stages.length === 0) {
    return <p className="text-sm text-slate-500">Belum ada riwayat stage</p>;
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
      <div className="space-y-4">
        {stages.map((stage, i) => (
          <div key={stage.id} className="relative flex items-start gap-4 pl-10">
            <div
              className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                i === stages.length - 1
                  ? 'bg-orange-500 border-orange-500'
                  : 'bg-white border-slate-300'
              }`}
            ></div>
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <StatusBadge status={stage.stage} />
                <span className="text-xs text-slate-400">{formatDateTime(stage.timestamp)}</span>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                <span className="font-medium">{stage.actor?.name || 'System'}</span>
                {stage.notes && <span className="ml-2 text-slate-500">— {stage.notes}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
