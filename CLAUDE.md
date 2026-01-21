# VCD Archive

A web application for cataloging and managing VCD (Video CD) releases.

## Project Status

**WIP Branch:** `wip/express-sqlite-backend` - Replacing non-functional Base44 backend with local Express + SQLite.

Frontend Vite setup needs debugging (blank page issue with JSX parsing).

## Architecture

```
VCD-Archive/
├── vcd-backend/          # Express + SQLite API server (port 4000)
│   └── src/
│       ├── app.ts        # Express app setup
│       ├── index.ts      # Server entry point
│       ├── db/
│       │   ├── database.ts   # SQLite connection (better-sqlite3)
│       │   ├── schema.sql    # Database schema
│       │   └── seed.ts       # Data import script
│       └── routes/
│           ├── auth.ts           # /api/auth/*
│           ├── releases.ts       # /api/releases/*
│           ├── userCollection.ts # /api/user-collection/*
│           ├── publisherLogos.ts # /api/publisher-logos/*
│           └── uploads.ts        # /api/upload
│
├── src/
│   ├── api/
│   │   └── apiClient.ts  # API client (replaces base44Client)
│   ├── main.jsx          # React entry point
│   └── index.css         # Tailwind styles
│
├── Components/           # Shadcn UI components
│   └── ui/
├── releases/             # Release-related components
├── admin/                # Admin components
│
├── Layout.jsx            # Main layout with navigation
├── home.jsx              # Home page (release grid)
├── ReleaseDetail.jsx     # Single release view
├── MyCollection.jsx      # User's collection
├── Admin.jsx             # Admin panel
└── EditRelease.jsx       # Edit release form
```

## Running the Project

### Backend

```bash
cd vcd-backend
npm install
npm run seed    # Import data (run once)
npm run dev     # Starts on http://localhost:4000
```

### Frontend

```bash
cd /Users/chuck/Projects/Apps/External/VCD-Archive
npm install
npm run dev     # Starts on http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/login` | Login (email, password) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/releases` | List/filter releases |
| POST | `/api/releases` | Create release |
| PUT | `/api/releases/:id` | Update release |
| DELETE | `/api/releases/:id` | Delete release |
| POST | `/api/releases/bulk` | Bulk create |
| GET | `/api/user-collection` | Filter user's collection |
| POST | `/api/user-collection` | Add to collection |
| DELETE | `/api/user-collection/:id` | Remove from collection |
| GET | `/api/publisher-logos` | List logos |
| POST | `/api/publisher-logos` | Create logo |
| DELETE | `/api/publisher-logos/:id` | Delete logo |
| POST | `/api/upload` | Upload file (multipart) |

## Default Credentials

- **Email:** admin@vcd.local
- **Password:** admin123

## Data Files

- `vcd-database-full-2026-01-15.json` - Release data for seeding
- `PublisherLogo_export.csv` - Publisher logos for seeding

## Key Patterns

### API Client Usage

All components import from `@/api/apiClient`:

```javascript
import { base44 } from '@/api/apiClient';

// Auth
await base44.auth.me();
await base44.auth.login(email, password);
base44.auth.logout();

// Entities
await base44.entities.Release.list('-created_date', 500);
await base44.entities.Release.filter({ country: 'Thailand' });
await base44.entities.Release.create(data);
await base44.entities.Release.update(id, data);
await base44.entities.Release.delete(id);

// File upload
const { file_url } = await base44.integrations.Core.UploadFile({ file });
```

### Path Aliases (vite.config.js)

- `@/components` → `./Components`
- `@/api` → `./src/api`
- `@/utils` → `./utils.js`
- `@/lib` → `./lib`

## Known Issues

1. Frontend shows blank page - Vite not parsing JSX correctly in some files
2. Layout.js was renamed to Layout.jsx but may need other .js files checked
