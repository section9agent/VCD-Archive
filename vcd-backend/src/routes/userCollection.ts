import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';

const router = Router();

// GET /api/user-collection - Filter collection
router.get('/', (req: Request, res: Response) => {
  const { created_by, release_id, status } = req.query;

  let sql = 'SELECT * FROM user_collection WHERE 1=1';
  const params: any[] = [];

  if (created_by) {
    sql += ' AND created_by = ?';
    params.push(created_by);
  }

  if (release_id) {
    sql += ' AND release_id = ?';
    params.push(release_id);
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_date DESC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// POST /api/user-collection - Add to collection
router.post('/', (req: Request, res: Response) => {
  const { release_id, status, user_rating, condition, notes, created_by } = req.body;

  if (!release_id || !status) {
    return res.status(400).json({ error: 'release_id and status are required' });
  }

  // Get the user email from the body or from auth header
  const userEmail = created_by || (req as any).user?.email;

  if (!userEmail) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO user_collection (id, release_id, status, user_rating, condition, notes, created_by, created_date, updated_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, release_id, status, user_rating || null, condition || null, notes || null, userEmail, now, now);

  const entry = db.prepare('SELECT * FROM user_collection WHERE id = ?').get(id);
  res.json(entry);
});

// DELETE /api/user-collection/:id - Remove from collection
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const result = db.prepare('DELETE FROM user_collection WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Collection entry not found' });
  }

  res.json({ success: true });
});

export default router;
