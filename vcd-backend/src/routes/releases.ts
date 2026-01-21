import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';

const router = Router();

// Helper to parse JSON arrays from DB
function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

// Helper to format release from DB
function formatRelease(row: any) {
  return {
    ...row,
    disc_images: parseJsonArray(row.disc_images),
    additional_images: parseJsonArray(row.additional_images)
  };
}

// GET /api/releases - List/filter releases
router.get('/', (req: Request, res: Response) => {
  const {
    id,
    title,
    publisher,
    country,
    sort = '-created_date',
    limit = '500'
  } = req.query;

  let sql = 'SELECT * FROM releases WHERE 1=1';
  const params: any[] = [];

  if (id) {
    sql += ' AND id = ?';
    params.push(id);
  }

  if (title) {
    sql += ' AND title LIKE ?';
    params.push(`%${title}%`);
  }

  if (publisher) {
    sql += ' AND publisher LIKE ?';
    params.push(`%${publisher}%`);
  }

  if (country) {
    sql += ' AND country LIKE ?';
    params.push(`%${country}%`);
  }

  // Handle sorting
  const sortField = String(sort).replace(/^-/, '');
  const sortOrder = String(sort).startsWith('-') ? 'DESC' : 'ASC';
  const allowedSortFields = ['created_date', 'updated_date', 'title', 'publisher', 'country'];

  if (allowedSortFields.includes(sortField)) {
    sql += ` ORDER BY ${sortField} ${sortOrder}`;
  } else {
    sql += ' ORDER BY created_date DESC';
  }

  sql += ' LIMIT ?';
  params.push(parseInt(String(limit), 10));

  const rows = db.prepare(sql).all(...params) as any[];
  res.json(rows.map(formatRelease));
});

// POST /api/releases - Create release
router.post('/', (req: Request, res: Response) => {
  const {
    title,
    publisher,
    number_of_discs = 1,
    year,
    audio_language,
    audio_language_2,
    subtitle_language,
    subtitle_language_2,
    subtitle_language_3,
    country,
    download_link,
    notes,
    cover_art,
    back_art,
    disc_images = [],
    additional_images = [],
    average_rating,
    rating_count = 0
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO releases (
      id, title, publisher, number_of_discs, year,
      audio_language, audio_language_2, subtitle_language, subtitle_language_2, subtitle_language_3,
      country, download_link, notes, cover_art, back_art,
      disc_images, additional_images, average_rating, rating_count,
      created_date, updated_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, title, publisher, number_of_discs, year,
    audio_language, audio_language_2, subtitle_language, subtitle_language_2, subtitle_language_3,
    country, download_link, notes, cover_art, back_art,
    JSON.stringify(disc_images), JSON.stringify(additional_images), average_rating, rating_count,
    now, now
  );

  const release = db.prepare('SELECT * FROM releases WHERE id = ?').get(id) as any;
  res.json(formatRelease(release));
});

// PUT /api/releases/:id - Update release
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM releases WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Release not found' });
  }

  const {
    title,
    publisher,
    number_of_discs,
    year,
    audio_language,
    audio_language_2,
    subtitle_language,
    subtitle_language_2,
    subtitle_language_3,
    country,
    download_link,
    notes,
    cover_art,
    back_art,
    disc_images,
    additional_images,
    average_rating,
    rating_count
  } = req.body;

  const updates: string[] = [];
  const params: any[] = [];

  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (publisher !== undefined) { updates.push('publisher = ?'); params.push(publisher); }
  if (number_of_discs !== undefined) { updates.push('number_of_discs = ?'); params.push(number_of_discs); }
  if (year !== undefined) { updates.push('year = ?'); params.push(year); }
  if (audio_language !== undefined) { updates.push('audio_language = ?'); params.push(audio_language); }
  if (audio_language_2 !== undefined) { updates.push('audio_language_2 = ?'); params.push(audio_language_2); }
  if (subtitle_language !== undefined) { updates.push('subtitle_language = ?'); params.push(subtitle_language); }
  if (subtitle_language_2 !== undefined) { updates.push('subtitle_language_2 = ?'); params.push(subtitle_language_2); }
  if (subtitle_language_3 !== undefined) { updates.push('subtitle_language_3 = ?'); params.push(subtitle_language_3); }
  if (country !== undefined) { updates.push('country = ?'); params.push(country); }
  if (download_link !== undefined) { updates.push('download_link = ?'); params.push(download_link); }
  if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
  if (cover_art !== undefined) { updates.push('cover_art = ?'); params.push(cover_art); }
  if (back_art !== undefined) { updates.push('back_art = ?'); params.push(back_art); }
  if (disc_images !== undefined) { updates.push('disc_images = ?'); params.push(JSON.stringify(disc_images)); }
  if (additional_images !== undefined) { updates.push('additional_images = ?'); params.push(JSON.stringify(additional_images)); }
  if (average_rating !== undefined) { updates.push('average_rating = ?'); params.push(average_rating); }
  if (rating_count !== undefined) { updates.push('rating_count = ?'); params.push(rating_count); }

  if (updates.length > 0) {
    updates.push('updated_date = ?');
    params.push(new Date().toISOString());
    params.push(id);

    db.prepare(`UPDATE releases SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }

  const release = db.prepare('SELECT * FROM releases WHERE id = ?').get(id) as any;
  res.json(formatRelease(release));
});

// DELETE /api/releases/:id - Delete release
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const result = db.prepare('DELETE FROM releases WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Release not found' });
  }

  res.json({ success: true });
});

// POST /api/releases/bulk - Bulk create releases
router.post('/bulk', (req: Request, res: Response) => {
  const releases = req.body;

  if (!Array.isArray(releases)) {
    return res.status(400).json({ error: 'Expected array of releases' });
  }

  const insert = db.prepare(`
    INSERT INTO releases (
      id, title, publisher, number_of_discs, year,
      audio_language, audio_language_2, subtitle_language, subtitle_language_2, subtitle_language_3,
      country, download_link, notes, cover_art, back_art,
      disc_images, additional_images, average_rating, rating_count,
      created_date, updated_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  const createdIds: string[] = [];

  const insertMany = db.transaction((items: any[]) => {
    for (const item of items) {
      const id = uuidv4();
      insert.run(
        id,
        item.title || '',
        item.publisher || null,
        item.number_of_discs || 1,
        item.year || null,
        item.audio_language || null,
        item.audio_language_2 || null,
        item.subtitle_language || null,
        item.subtitle_language_2 || null,
        item.subtitle_language_3 || null,
        item.country || null,
        item.download_link || null,
        item.notes || null,
        item.cover_art || null,
        item.back_art || null,
        JSON.stringify(item.disc_images || []),
        JSON.stringify(item.additional_images || []),
        item.average_rating || null,
        item.rating_count || 0,
        now,
        now
      );
      createdIds.push(id);
    }
  });

  insertMany(releases);

  res.json({
    success: true,
    count: createdIds.length,
    ids: createdIds
  });
});

export default router;
