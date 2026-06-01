'use client';

import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDateTime, formatNumber } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import Link from 'next/link';
import { ArrowLeft, Truck, Building2, Package, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeliveryOrderDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['delivery-order', id],
    queryFn: () => api.get(`/delivery-orders/${id}`).then((r) => r.data.data),
  });

  async function handleReceive() {
    try {
      const res = await api.patch(`/delivery-orders/${id}/receive`);
      toast.success(res.data.message);
      queryClient.invalidateQueries(['delivery-order', id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to receive');
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (!order) return <p className="text-slate-500">Delivery Order not found</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/delivery-orders" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to Delivery Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{order.do_number}</h1>
          <p className="text-slate-500 mt-1">Delivery Order</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
          <Truck className="h-4 w-4" /> {order.status || 'INCOMING'}
        </div>
      </div>

      {/* Receive Action */}
      {order.status !== 'RECEIVED' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-700">Confirm Receipt</p>
            <p className="text-sm text-slate-500">Mark this DO as received — raw material lots will be created automatically</p>
          </div>
          <button onClick={handleReceive} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg">
            ✓ Receive DO
          </button>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supplier */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-slate-400" />
            <h3 className="font-semibold text-slate-700 text-sm">Supplier</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="text-slate-800 font-medium">{order.supplier?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Code</span><span className="text-slate-800">{order.supplier?.code}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Contact</span><span className="text-slate-800">{order.supplier?.contact_name || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="text-slate-800">{order.supplier?.phone || '-'}</span></div>
          </div>
        </div>

        {/* Timing */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-slate-400" />
            <h3 className="font-semibold text-slate-700 text-sm">Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">DO Number</span><span className="text-slate-800 font-medium">{order.do_number}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Received</span><span className="text-slate-800">{formatDateTime(order.received_date)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Total Lots</span><span className="text-slate-800 font-medium">{order.rawLots?.length || 0}</span></div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-700 text-sm mb-2">Notes</h3>
          <p className="text-sm text-slate-600">{order.notes}</p>
        </div>
      )}

      {/* Raw Material Lots */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <Package className="h-4 w-4 text-slate-400" />
          <h3 className="font-semibold text-slate-700 text-sm">Raw Material Lots from this DO</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Lot No.</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Material</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Qty</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {order.rawLots?.map((lot) => (
              <tr key={lot.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/raw-lots/${lot.id}`} className="font-medium text-blue-600 hover:underline">{lot.internal_lot_no}</Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{lot.material?.name}</td>
                <td className="px-4 py-3 text-slate-600">{formatNumber(lot.initial_qty)} {lot.material?.unit}</td>
                <td className="px-4 py-3"><StatusBadge status={lot.current_status} /></td>
              </tr>
            ))}
            {(!order.rawLots || order.rawLots.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No lots linked to this DO</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
