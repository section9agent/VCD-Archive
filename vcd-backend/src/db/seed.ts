import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import db from './database';

const DATA_DIR = path.join(__dirname, '../../../');

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  console.log('Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  db.exec('DELETE FROM sessions');
  db.exec('DELETE FROM user_collection');
  db.exec('DELETE FROM publisher_logos');
  db.exec('DELETE FROM releases');
  db.exec('DELETE FROM users');

  // Create default admin user
  console.log('Creating admin user...');
  const adminId = uuidv4();
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run(adminId, 'admin@vcd.local', hashPassword('admin123'), 'admin');
  console.log('  Created admin@vcd.local (password: admin123)');

  // Import releases from JSON
  const releasesFile = path.join(DATA_DIR, 'vcd-database-full-2026-01-15.json');
  if (fs.existsSync(releasesFile)) {
    console.log('Importing releases from JSON...');
    const releasesData = JSON.parse(fs.readFileSync(releasesFile, 'utf8'));

    const insertRelease = db.prepare(`
      INSERT INTO releases (
        id, title, publisher, number_of_discs, year,
        audio_language, audio_language_2, subtitle_language, subtitle_language_2, subtitle_language_3,
        country, download_link, notes, cover_art, back_art,
        disc_images, additional_images, average_rating, rating_count,
        created_date, updated_date, created_by_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((releases: any[]) => {
      for (const r of releases) {
        const id = r.id || uuidv4();
        insertRelease.run(
          id,
          r.title || '',
          r.publisher || null,
          r.number_of_discs || 1,
          r.year || null,
          r.audio_language || null,
          r.audio_language_2 || null,
          r.subtitle_language || null,
          r.subtitle_language_2 || null,
          r.subtitle_language_3 || null,
          r.country || null,
          r.download_link || null,
          r.notes || null,
          r.cover_art || null,
          r.back_art || null,
          JSON.stringify(r.disc_images || []),
          JSON.stringify(r.additional_images || []),
          r.average_rating || null,
          r.rating_count || 0,
          r.created_date || new Date().toISOString(),
          r.updated_date || new Date().toISOString(),
          r.created_by_id || adminId
        );
      }
    });

    insertMany(releasesData);
    console.log(`  Imported ${releasesData.length} releases`);
  } else {
    console.log('  No releases JSON file found, skipping...');
  }

  // Import publisher logos from CSV
  const logosFile = path.join(DATA_DIR, 'PublisherLogo_export.csv');
  if (fs.existsSync(logosFile)) {
    console.log('Importing publisher logos from CSV...');
    const csvContent = fs.readFileSync(logosFile, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    // Skip header
    const dataLines = lines.slice(1);

    const insertLogo = db.prepare(`
      INSERT INTO publisher_logos (id, publisher_name, logo_url, created_date, updated_date)
      VALUES (?, ?, ?, ?, ?)
    `);

    let logoCount = 0;
    const insertLogos = db.transaction(() => {
      for (const line of dataLines) {
        // Parse CSV line (handle quoted values)
        const match = line.match(/^"([^"]*)",\s*"([^"]*)"/);
        if (match) {
          const [, publisherName, logoUrl] = match;
          if (publisherName && logoUrl) {
            const id = uuidv4();
            const now = new Date().toISOString();
            insertLogo.run(id, publisherName, logoUrl, now, now);
            logoCount++;
          }
        }
      }
    });

    insertLogos();
    console.log(`  Imported ${logoCount} publisher logos`);
  } else {
    console.log('  No publisher logos CSV file found, skipping...');
  }

  // Print summary
  const releaseCount = (db.prepare('SELECT COUNT(*) as count FROM releases').get() as any).count;
  const logoCount = (db.prepare('SELECT COUNT(*) as count FROM publisher_logos').get() as any).count;
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;

  console.log('\nSeed completed!');
  console.log(`  Releases: ${releaseCount}`);
  console.log(`  Publisher logos: ${logoCount}`);
  console.log(`  Users: ${userCount}`);
  console.log('\nYou can now start the server with: npm run dev');
}

seed().catch(console.error);
