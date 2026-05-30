'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Package, Factory, Warehouse, Activity } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get('/dashboard/summary').then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const { rawLots, productionOrders, finishedGoods, recentActivity } = data || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Raw Lots */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-slate-700">Raw Material Lots</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{rawLots?.total || 0}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <span className="text-slate-500">Incoming: <strong>{rawLots?.incoming || 0}</strong></span>
            <span className="text-yellow-600">QC Pending: <strong>{rawLots?.qcPending || 0}</strong></span>
            <span className="text-green-600">Approved: <strong>{rawLots?.qcApproved || 0}</strong></span>
            <span className="text-red-600">Rejected: <strong>{rawLots?.rejected || 0}</strong></span>
          </div>
        </div>

        {/* Production Orders */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Factory className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-700">Production Orders</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{productionOrders?.total || 0}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <span className="text-slate-500">Queued: <strong>{productionOrders?.queued || 0}</strong></span>
            <span className="text-blue-600">Scheduled: <strong>{productionOrders?.scheduled || 0}</strong></span>
            <span className="text-orange-600">In Progress: <strong>{productionOrders?.inProgress || 0}</strong></span>
            <span className="text-green-600">Completed: <strong>{productionOrders?.completed || 0}</strong></span>
          </div>
        </div>

        {/* Finished Goods */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Warehouse className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-700">Finished Goods</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{finishedGoods?.total || 0}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <span className="text-blue-600">In Warehouse: <strong>{finishedGoods?.inWarehouse || 0}</strong></span>
            <span className="text-green-600">Dispatched: <strong>{finishedGoods?.dispatched || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-700">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {recentActivity?.length === 0 && (
            <p className="text-sm text-slate-500">No activity yet</p>
          )}
          {recentActivity?.map((act, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <span className="text-sm font-medium text-slate-700">{act.lotNumber}</span>
                <span className="mx-2 text-slate-400">→</span>
                <span className="text-sm text-slate-600">{act.stage.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{act.actor}</p>
                <p className="text-xs text-slate-400">{formatDateTime(act.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
