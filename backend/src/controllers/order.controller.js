import { prisma } from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import {
  normalizePhone,
  oneOf,
  optionalText,
  parseDateOnly,
  requiredInteger,
  requiredText,
  todayInJakarta,
} from '../utils/validate.js';

const STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

function generateCode() {
  const date = todayInJakarta().slice(2).replaceAll('-', ''); // YYMMDD
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';

  for (let i = 0; i < 4; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return `AJM-${date}-${suffix}`;
}

export const create = asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  const customerName = requiredText(body.customerName, 'Nama', { min: 2, max: 100 });
  const phone = normalizePhone(requiredText(body.phone, 'Nomor WhatsApp', { max: 25 }));
  const vehicle = optionalText(body.vehicle, 'Jenis motor', { max: 100 });
  const plateNumber = optionalText(body.plateNumber, 'Nomor polisi', { max: 20 });
  const complaint = optionalText(body.complaint, 'Keluhan', { max: 1000 });
  const serviceId = requiredInteger(body.serviceId, 'Layanan', { min: 1 });
  const preferredDateRaw = optionalText(body.preferredDate, 'Tanggal', { max: 10 });

  const service = await prisma.service.findFirst({
    where: { id: serviceId, isActive: true },
  });

  if (!service) {
    throw new ApiError(400, 'Layanan tidak ditemukan atau sudah tidak aktif.');
  }

  let preferredDate = null;
  if (preferredDateRaw) {
    preferredDate = parseDateOnly(preferredDateRaw, 'Tanggal kedatangan');
    if (preferredDateRaw < todayInJakarta()) {
      throw new ApiError(400, 'Tanggal kedatangan tidak boleh di masa lalu.');
    }
  }

  let order;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      order = await prisma.order.create({
        data: {
          code: generateCode(),
          customerName,
          phone,
          vehicle,
          plateNumber,
          serviceId: service.id,
          serviceName: service.name,
          preferredDate,
          complaint,
        },
      });
      break;
    } catch (error) {
      if (error.code !== 'P2002' || attempt === 4) throw error;
    }
  }

  res.status(201).json({
    message: 'Pesanan berhasil dibuat. Lanjutkan konfirmasi lewat WhatsApp.',
    data: order,
  });
});

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const status = req.query.status;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  if (status && status !== 'ALL') {
    oneOf(status, 'Status', STATUSES);
  }

  const where = {
    ...(status && status !== 'ALL' ? { status } : {}),
    ...(search
      ? {
          OR: [
            { code: { contains: search } },
            { customerName: { contains: search } },
            { phone: { contains: search } },
            { serviceName: { contains: search } },
          ],
        }
      : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({
    data: orders,
    meta: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
});

export const track = asyncHandler(async (req, res) => {
  const compact = String(req.params.code || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const match = /^AJM(\d{6})([A-Z0-9]{4})$/.exec(compact);

  if (!match) {
    throw new ApiError(404, 'Pesanan tidak ditemukan. Periksa kembali kode booking Anda.');
  }

  const order = await prisma.order.findUnique({
    where: { code: `AJM-${match[1]}-${match[2]}` },
    select: {
      code: true,
      customerName: true,
      serviceName: true,
      vehicle: true,
      plateNumber: true,
      preferredDate: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!order) {
    throw new ApiError(404, 'Pesanan tidak ditemukan. Periksa kembali kode booking Anda.');
  }

  res.set('Cache-Control', 'no-store');
  res.json({ data: order });
});

export const detail = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: { service: true },
  });

  if (!order) throw new ApiError(404, 'Pesanan tidak ditemukan.');

  res.json({ data: order });
});

export const update = asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  const data = {};

  if (body.status !== undefined) {
    data.status = oneOf(body.status, 'Status', STATUSES);
  }

  if (body.adminNote !== undefined) {
    data.adminNote = optionalText(body.adminNote, 'Catatan admin', { max: 1000 });
  }

  if (Object.keys(data).length === 0) {
    throw new ApiError(400, 'Tidak ada data yang diubah.');
  }

  const order = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data,
  });

  res.json({ data: order });
});

export const stats = asyncHandler(async (_req, res) => {
  const today = todayInJakarta();
  const todayStart = new Date(`${today}T00:00:00+07:00`);
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const monthStart = new Date(`${today.slice(0, 8)}01T00:00:00+07:00`);

  const [total, grouped, todayOrders, monthCompleted, activeServices] = await Promise.all([
    prisma.order.count(),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.count({ where: { createdAt: { gte: todayStart, lt: tomorrowStart } } }),
    prisma.order.count({
      where: { status: 'COMPLETED', updatedAt: { gte: monthStart } },
    }),
    prisma.service.count({ where: { isActive: true } }),
  ]);

  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  for (const group of grouped) {
    counts[group.status] = group._count._all;
  }

  res.json({
    data: {
      totalOrders: total,
      todayOrders,
      monthCompleted,
      activeServices,
      pending: counts.PENDING,
      confirmed: counts.CONFIRMED,
      inProgress: counts.IN_PROGRESS,
      completed: counts.COMPLETED,
      cancelled: counts.CANCELLED,
    },
  });
});
