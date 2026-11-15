import { prisma } from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import {
  optionalBoolean,
  optionalText,
  requiredInteger,
  requiredText,
  slugify,
} from '../utils/validate.js';

function parseServicePayload(body, { partial = false } = {}) {
  const data = {};

  if (!partial || body.name !== undefined) {
    data.name = requiredText(body.name, 'Nama layanan', { max: 120 });
  }

  if (!partial || body.category !== undefined) {
    data.category = requiredText(body.category, 'Kategori', { max: 60 });
  }

  if (!partial || body.description !== undefined) {
    data.description = requiredText(body.description, 'Deskripsi', { max: 1000 });
  }

  if (!partial || body.price !== undefined) {
    data.price = requiredInteger(body.price, 'Harga', { min: 0, max: 1_000_000_000 });
  }

  if (body.duration !== undefined) {
    data.duration = optionalText(body.duration, 'Estimasi durasi', { max: 60 });
  }

  if (body.icon !== undefined) {
    data.icon = optionalText(body.icon, 'Ikon', { max: 40 }) || 'wrench';
  }

  if (body.isActive !== undefined) {
    data.isActive = optionalBoolean(body.isActive, 'Status aktif');
  }

  if (body.isFeatured !== undefined) {
    data.isFeatured = optionalBoolean(body.isFeatured, 'Status unggulan');
  }

  if (body.sortOrder !== undefined) {
    data.sortOrder = requiredInteger(body.sortOrder, 'Urutan', { min: 0, max: 9999 });
  }

  return data;
}

async function createUniqueSlug(name) {
  const base = slugify(name) || 'layanan';
  let slug = base;
  let counter = 2;

  while (await prisma.service.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

export const listPublic = asyncHandler(async (_req, res) => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });

  res.json({ data: services });
});

export const detailPublic = asyncHandler(async (req, res) => {
  const service = await prisma.service.findFirst({
    where: { slug: req.params.slug, isActive: true },
  });

  if (!service) throw new ApiError(404, 'Layanan tidak ditemukan.');

  res.json({ data: service });
});

export const listAdmin = asyncHandler(async (_req, res) => {
  const services = await prisma.service.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });

  res.json({ data: services });
});

export const create = asyncHandler(async (req, res) => {
  const payload = parseServicePayload(req.body ?? {});
  const service = await prisma.service.create({
    data: {
      ...payload,
      slug: await createUniqueSlug(payload.name),
      isActive: payload.isActive ?? true,
      isFeatured: payload.isFeatured ?? false,
      sortOrder: payload.sortOrder ?? 0,
    },
  });

  res.status(201).json({ data: service });
});

export const update = asyncHandler(async (req, res) => {
  const payload = parseServicePayload(req.body ?? {}, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, 'Tidak ada data yang diubah.');
  }

  const service = await prisma.service.update({
    where: { id: Number(req.params.id) },
    data: payload,
  });

  res.json({ data: service });
});

export const remove = asyncHandler(async (req, res) => {
  await prisma.service.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Layanan berhasil dihapus.' });
});
