-- VCD Archive Database Schema

-- Releases table - stores all VCD entries
CREATE TABLE IF NOT EXISTS releases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    publisher TEXT,
    number_of_discs INTEGER DEFAULT 1,
    year INTEGER,
    audio_language TEXT,
    audio_language_2 TEXT,
    subtitle_language TEXT,
    subtitle_language_2 TEXT,
    subtitle_language_3 TEXT,
    country TEXT,
    download_link TEXT,
    notes TEXT,
    cover_art TEXT,
    back_art TEXT,
    disc_images TEXT,  -- JSON array stored as text
    additional_images TEXT,  -- JSON array stored as text
    average_rating REAL,
    rating_count INTEGER DEFAULT 0,
    created_date TEXT DEFAULT (datetime('now')),
    updated_date TEXT DEFAULT (datetime('now')),
    created_by_id TEXT
);

-- User collection table - tracks what users have/want
CREATE TABLE IF NOT EXISTS user_collection (
    id TEXT PRIMARY KEY,
    release_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('have', 'want')),
    user_rating INTEGER,
    condition TEXT,
    notes TEXT,
    created_by TEXT NOT NULL,  -- email
    created_date TEXT DEFAULT (datetime('now')),
    updated_date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE
);

-- Publisher logos table
CREATE TABLE IF NOT EXISTS publisher_logos (
    id TEXT PRIMARY KEY,
    publisher_name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    created_date TEXT DEFAULT (datetime('now')),
    updated_date TEXT DEFAULT (datetime('now'))
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    created_date TEXT DEFAULT (datetime('now'))
);

-- Sessions table for token-based auth
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_releases_title ON releases(title);
CREATE INDEX IF NOT EXISTS idx_releases_publisher ON releases(publisher);
CREATE INDEX IF NOT EXISTS idx_releases_country ON releases(country);
CREATE INDEX IF NOT EXISTS idx_releases_created_date ON releases(created_date);
CREATE INDEX IF NOT EXISTS idx_user_collection_release ON user_collection(release_id);
CREATE INDEX IF NOT EXISTS idx_user_collection_user ON user_collection(created_by);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
