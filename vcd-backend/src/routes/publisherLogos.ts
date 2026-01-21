import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';

const router = Router();

// GET /api/publisher-logos - List logos
router.get('/', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM publisher_logos ORDER BY publisher_name').all();
  res.json(rows);
});

// POST /api/publisher-logos - Create logo
router.post('/', (req: Request, res: Response) => {
  const { publisher_name, logo_url } = req.body;

  if (!publisher_name || !logo_url) {
    return res.status(400).json({ error: 'publisher_name and logo_url are required' });
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO publisher_logos (id, publisher_name, logo_url, created_date, updated_date)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, publisher_name, logo_url, now, now);

  const logo = db.prepare('SELECT * FROM publisher_logos WHERE id = ?').get(id);
  res.json(logo);
});

// DELETE /api/publisher-logos/:id - Delete logo
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const result = db.prepare('DELETE FROM publisher_logos WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Logo not found' });
  }

  res.json({ success: true });
});

export default router;
