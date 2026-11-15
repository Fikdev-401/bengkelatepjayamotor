import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { requiredText } from '../utils/validate.js';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const login = asyncHandler(async (req, res) => {
  const email = requiredText(req.body?.email, 'Email', { max: 150 }).toLowerCase();
  const password = requiredText(req.body?.password, 'Password', { min: 6, max: 100 });

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !passwordMatch) {
    throw new ApiError(401, 'Email atau password salah.');
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  res.json({ token, user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
