import { ApiError } from './http.js';

export function requiredText(value, label, { min = 1, max = 255 } = {}) {
  if (typeof value !== 'string' || value.trim().length < min) {
    throw new ApiError(400, `${label} wajib diisi minimal ${min} karakter.`);
  }

  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new ApiError(400, `${label} maksimal ${max} karakter.`);
  }

  return trimmed;
}

export function optionalText(value, label, { max = 255 } = {}) {
  if (value === undefined || value === null) return undefined;

  if (typeof value !== 'string') {
    throw new ApiError(400, `${label} tidak valid.`);
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.length > max) {
    throw new ApiError(400, `${label} maksimal ${max} karakter.`);
  }

  return trimmed;
}

export function requiredInteger(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = typeof value === 'string' ? Number(value) : value;

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new ApiError(400, `${label} tidak valid.`);
  }

  return parsed;
}

export function optionalBoolean(value, label) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new ApiError(400, `${label} harus berupa boolean.`);
}

export function oneOf(value, label, allowed) {
  if (!allowed.includes(value)) {
    throw new ApiError(400, `${label} tidak valid.`);
  }

  return value;
}

/**
 * Menyamakan nomor HP ke format internasional tanpa "+": 6281234567890
 */
export function normalizePhone(value) {
  const digits = String(value).replace(/\D/g, '');

  if (!digits) {
    throw new ApiError(400, 'Nomor WhatsApp wajib diisi.');
  }

  let normalized = digits;

  if (normalized.startsWith('0')) {
    normalized = `62${normalized.slice(1)}`;
  } else if (normalized.startsWith('8')) {
    normalized = `62${normalized}`;
  } else if (!normalized.startsWith('62')) {
    normalized = `62${normalized}`;
  }

  if (normalized.length < 10 || normalized.length > 15) {
    throw new ApiError(400, 'Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890');
  }

  return normalized;
}

/**
 * Tanggal hari ini (YYYY-MM-DD) menurut zona waktu WIB.
 */
export function todayInJakarta() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Mengubah "YYYY-MM-DD" menjadi Date pada tengah malam UTC,
 * cocok untuk kolom Prisma bertipe @db.Date.
 */
export function parseDateOnly(value, label = 'Tanggal') {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, `${label} tidak valid. Gunakan format YYYY-MM-DD.`);
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `${label} tidak valid.`);
  }

  return parsed;
}

export function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
