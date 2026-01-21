import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import db from '../db/database';

const router = Router();

// Simple password hashing (for local use)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Get user from session token
export function getUserFromToken(token: string | undefined) {
  if (!token) return null;

  const session = db.prepare(`
    SELECT s.*, u.email, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token) as any;

  if (!session) return null;

  return {
    id: session.user_id,
    email: session.email,
    role: session.role
  };
}

// Middleware to attach user to request
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
  (req as any).user = getUserFromToken(token);
  next();
}

// GET /api/auth/me - Get current user
router.get('/me', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = getUserFromToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json(user);
});

// POST /api/auth/login - Login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create session
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), user.id, token, expiresAt);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});

// POST /api/auth/logout - Logout
router.post('/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }

  res.json({ success: true });
});

// POST /api/auth/register - Register (for initial setup)
router.post('/register', (req: Request, res: Response) => {
  const { email, password, role = 'user' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const id = uuidv4();
  const passwordHash = hashPassword(password);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run(id, email, passwordHash, role);

  // Auto-login after registration
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), id, token, expiresAt);

  res.json({
    token,
    user: {
      id,
      email,
      role
    }
  });
});

export default router;
