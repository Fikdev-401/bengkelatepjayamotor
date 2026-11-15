export function rupiah(value) {
  const number = Number(value) || 0;
  return `Rp ${number.toLocaleString('id-ID')}`;
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

export function todayJakarta() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export const ORDER_STATUS = {
  PENDING: { label: 'Menunggu konfirmasi', tone: 'pending' },
  CONFIRMED: { label: 'Dikonfirmasi', tone: 'confirmed' },
  IN_PROGRESS: { label: 'Sedang dikerjakan', tone: 'progress' },
  COMPLETED: { label: 'Selesai', tone: 'done' },
  CANCELLED: { label: 'Dibatalkan', tone: 'cancelled' },
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS).map(([value, item]) => ({
  value,
  label: item.label,
}));

export function statusInfo(status) {
  return ORDER_STATUS[status] || { label: status, tone: 'pending' };
}
