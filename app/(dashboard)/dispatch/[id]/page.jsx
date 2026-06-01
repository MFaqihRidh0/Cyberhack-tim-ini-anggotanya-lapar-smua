'use client';

import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDateTime, formatNumber } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import Link from 'next/link';
import { ArrowLeft, Send, User, MapPin, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DispatchDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: dispatch, isLoading } = useQuery({
    queryKey: ['dispatch', id],
    queryFn: () => api.get(`/sample-dispatches`).then((r) => {
      const all = r.data.data || [];
      return all.find((d) => d.id === id) || null;
    }),
  });

  async function handleConfirm() {
    try {
      await api.patch(`/sample-dispatches/${id}/confirm`);
      toast.success('Dispatch confirmed');
      queryClient.invalidateQueries(['dispatch', id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm');
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (!dispatch) return <p className="text-slate-500">Dispatch not found</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <Link href="/dispatch" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to Dispatches
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{dispatch.dispatch_number}</h1>
          <p className="text-slate-500 mt-1">Sample Dispatch</p>
        </div>
        {dispatch.received_confirmed
          ? <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium"><CheckCircle className="h-4 w-4" /> Confirmed</span>
          : <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium"><Clock className="h-4 w-4" /> Pending</span>}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-slate-400" />
            <h3 className="font-semibold text-slate-700 text-sm">Customer Information</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="text-slate-800 font-medium">{dispatch.customer_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="text-slate-800">{dispatch.customer_email || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="text-slate-800">{dispatch.customer_phone || '-'}</span></div>
          </div>
        </div>

        {/* Destination Info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-slate-400" />
            <h3 className="font-semibold text-slate-700 text-sm">Destination</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="text-slate-800 font-medium">{dispatch.destination}</span></div>
            {dispatch.country && <div className="flex justify-between"><span className="text-slate-500">Country</span><span className="text-slate-800">{dispatch.country}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">Tracking No.</span><span className="text-slate-800">{dispatch.tracking_number || '-'}</span></div>
          </div>
        </div>

        {/* Lot Info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-slate-400" />
            <h3 className="font-semibold text-slate-700 text-sm">Lot Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Lot ID</span><span className="text-slate-800 font-medium">{dispatch.finished_lot?.lot_number || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Product</span><span className="text-slate-800">{dispatch.finished_lot?.product?.name || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Quantity</span><span className="text-slate-800 font-medium">{formatNumber(dispatch.quantity)} {dispatch.unit}</span></div>
          </div>
        </div>

        {/* Timing Info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="h-4 w-4 text-slate-400" />
            <h3 className="font-semibold text-slate-700 text-sm">Timing</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Dispatched</span><span className="text-slate-800">{formatDateTime(dispatch.dispatch_date)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Confirmed</span><span className="text-slate-800">{dispatch.received_confirmed ? formatDateTime(dispatch.received_at) : 'Not yet'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Dispatched By</span><span className="text-slate-800">{dispatch.dispatched_by?.name || '-'}</span></div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {dispatch.notes && (
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-700 text-sm mb-2">Notes</h3>
          <p className="text-sm text-slate-600">{dispatch.notes}</p>
        </div>
      )}

      {/* Confirm Action */}
      {!dispatch.received_confirmed && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-700">Confirm Receipt</p>
            <p className="text-sm text-slate-500">Mark this dispatch as received by the customer</p>
          </div>
          <button onClick={handleConfirm} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg">
            Confirm Received
          </button>
        </div>
      )}
    </div>
  );
}
