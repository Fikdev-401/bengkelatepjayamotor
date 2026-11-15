import { ApiError } from '../utils/http.js';

export function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  // Kesalahan umum Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'Data dengan nilai tersebut sudah ada.' });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({ message: 'Data tidak ditemukan.' });
  }

  if (error.code === 'P2003') {
    return res.status(409).json({ message: 'Data masih dipakai oleh data lain.' });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Format data yang dikirim tidak valid.' });
  }

  console.error('[error]', error);

  res.status(500).json({ message: 'Terjadi kesalahan pada server. Silakan coba lagi.' });
}
