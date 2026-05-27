/**
 * M1 — Auth routes.
 *
 * NOTE: This is the design-phase mock. The endpoint signature, validation
 * shape, response shape, and JWT issuance match what the production version
 * will do — only the credential check is mocked (any 6+ char password is
 * accepted). When MySQL is ready and managers are seeded, swap the body of
 * `POST /login` for a real bcrypt-compare against the users table.
 */
import { Router } from 'express';
import { z } from 'zod';
import { signToken } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';

const router = Router();

const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Enter your email or phone'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

router.post('/login', (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new ApiError(400, 'INVALID_CREDENTIALS', first?.message ?? 'Invalid input');
    }

    const { identifier } = parsed.data;
    const isEmail = identifier.includes('@');
    const fullName = identifier
      .split(isEmail ? '@' : ' ')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Manager';

    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');

    const user = {
      id: 1,
      email: isEmail ? identifier : 'manager@servesense.local',
      phone: isEmail ? null : identifier,
      fullName,
      role: 'manager' as const,
      initials,
    };

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Simulate small latency so the loading state is visible in design review.
    setTimeout(() => res.json({ token, user }), 350);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  // Stateless JWT — client just discards. Endpoint is here so the contract is real.
  res.status(204).end();
});

export default router;
