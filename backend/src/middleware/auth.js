import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Silakan login terlebih dahulu.');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Sesi login sudah tidak berlaku. Silakan login ulang.');
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    throw new ApiError(401, 'Akun admin tidak ditemukan.');
  }

  req.user = user;
  next();
});

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'ADMIN') {
    return next(new ApiError(403, 'Akses ditolak. Halaman ini khusus admin.'));
  }

  next();
}
