import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '-';
  return Number(num).toLocaleString('id-ID');
}

export const STATUS_COLORS = {
  INCOMING: 'bg-gray-100 text-gray-700',
  RECEIVED: 'bg-blue-100 text-blue-700',
  QC_PENDING: 'bg-yellow-100 text-yellow-700',
  QC_APPROVED: 'bg-green-100 text-green-700',
  QC_REJECTED: 'bg-red-100 text-red-700',
  IN_QUEUE: 'bg-blue-100 text-blue-700',
  IN_PRODUCTION: 'bg-orange-100 text-orange-700',
  CONSUMED: 'bg-gray-100 text-gray-500',
  ON_HOLD: 'bg-purple-100 text-purple-700',
  PRODUCED: 'bg-green-100 text-green-700',
  IN_WAREHOUSE: 'bg-blue-100 text-blue-700',
  PARTIALLY_DISPATCHED: 'bg-orange-100 text-orange-700',
  FULLY_DISPATCHED: 'bg-green-100 text-green-700',
  QUEUED: 'bg-gray-100 text-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};
