import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'swasthya-setu-super-secret-key-2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    facilityId?: string | null;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const demoRole = req.headers['x-demo-role'] as string;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      return next();
    } catch (err) {
      // If token expired/invalid, try demo role fallback
    }
  }

  // Fallback for demo role switcher convenience
  if (demoRole) {
    prisma.user.findFirst({ where: { role: demoRole.toUpperCase() } })
      .then(user => {
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            facilityId: user.facilityId
          };
        }
        next();
      })
      .catch(() => next());
    return;
  }

  // Default anonymous public pass-through (controllers can check req.user where necessary)
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]` });
    }
    next();
  };
}
