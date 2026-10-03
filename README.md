# TechNova — AI Tech News & Content Generation Platform (MERN Stack)

A production-grade MERN-stack web application that lets an admin log in, scan the latest tech trends per category, generate humanized platform-specific content (Facebook, Instagram, LinkedIn, Pinterest, Threads, Twitter/X, Reddit, Blog), generate AI images, and generate code from prompts — all powered by Google Gemini.

Built for **Vercel deployment**. The project root IS the React frontend; the Express backend lives in `server/`.

## Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Zustand + React Router (lives at the project root)
- **Backend**: Node.js + Express + MongoDB Atlas (Mongoose) + JWT auth + bcrypt password hashing (lives in `server/`)
- **AI**: Google Gemini REST API (`gemini-3.5-flash` text, `gemini-3.1-flash-image` images)
- **Deployment**: Vercel — React static build + Express serverless function via `api/[[...slug]].js`

## Project structure
```
tech-nova/
├── api/[[...slug]].js     # Vercel serverless entry — mounts the Express app
├── src/                   # React frontend source
│   ├── components/
│   │   ├── animation/     # 15 premium animation components (CircularGallery, MagicBento, PillNav, etc.)
│   │   ├── platform/      # App views (Login, Dashboard, Scan, Topic, ImagePanel, CodePanel, etc.)
│   │   └── ui/            # shadcn/ui component kit
│   ├── lib/               # api client, types, utils
│   ├── store/             # Zustand stores (auth, app)
│   ├── App.tsx            # Router + auth gate
│   └── main.tsx
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # MongoDB Atlas connection + env loader
│   │   ├── models/        # Mongoose schemas (User, Scan, Content, Image, Code)
│   │   ├── middleware/    # auth (JWT), rate-limit, error, validate
│   │   ├── routes/        # auth, scan, content, posting-time, image, code, history
│   │   ├── services/      # Gemini API helper
│   │   ├── utils/         # Seed script (creates admin user)
│   │   └── index.js       # Express app (exported for Vercel + standalone)
│   ├── .env               # Local dev env (MongoDB Atlas URI, JWT, Gemini key, admin seed)
│   └── package.json       # Local dev scripts (deps live in root)
├── public/                # Static assets (logo)
├── index.html             # Vite entry
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json           # All dependencies (frontend + backend) — Vercel installs in one pass
└── vercel.json            # Build config (buildCommand + outputDirectory + serverless function)
```

## Local development

### 1. Install dependencies (one command installs everything)
```bash
npm install
```

### 2. Configure environment
`server/.env` is included with your MongoDB Atlas URI, JWT secret, admin seed, and Gemini API key. Review and tweak if needed.

### 3. Seed the admin user
```bash
npm run seed
```
Creates the admin user (`admin` / `Admin@2024`) in your MongoDB Atlas database. **You must run this once before logging in.**

### 4. Run both frontend and backend
```bash
npm run dev:all
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- The Vite dev server proxies `/api/*` to the backend automatically.

Or run them separately:
- `npm run dev` (frontend only)
- `npm run dev:server` (backend only)

Log in with `admin` / `Admin@2024`.

## Production deployment on Vercel

### 1. Push to GitHub
```bash
git init
git add -A
git commit -m "Initial MERN commit"
git remote add origin https://github.com/<you>/tech-nova.git
git push -u origin main
```

### 2. Import on Vercel
1. Go to https://vercel.com/new
2. Import the GitHub repo
3. **IMPORTANT**: Set **Root Directory** to `./` (the project root — NOT `client/` or `server/`). The default is correct.
4. **Framework Preset**: Vite (auto-detected from `vite.config.ts`)
5. **Build Command**: `npm run vercel-build` (auto-detected from `vercel.json`)
6. **Output Directory**: `dist` (auto-detected from `vercel.json`)
7. Click **Deploy**

### 3. Set environment variables on Vercel
In `Project Settings → Environment Variables`, add:
| Variable | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://socialmarketing225_db_user:wCnZEs9wenpMwPdX@cluster0.rk8evnr.mongodb.net/?appName=Cluster0` |
| `MONGODB_DB` | `tech_nova` |
| `JWT_SECRET` | (use a strong random string, e.g. `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `24h` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `Admin@2024` |
| `ADMIN_EMAIL` | `admin@tech-nova.local` |
| `GEMINI_API_KEY` | `<your_gemini_api_key>` |
| `GEMINI_TEXT_MODEL` | `gemini-3.5-flash` |
| `GEMINI_IMAGE_MODEL` | `gemini-3.1-flash-image` |
| `CLIENT_URL` | `https://<your-frontend>.vercel.app` |

### 4. Whitelist your MongoDB Atlas IP
In MongoDB Atlas: Network Access → Add IP Address → Add `0.0.0.0/0` (allows Vercel's servers to connect) or use Vercel's IP ranges.

### 5. Seed the admin user (after first deploy)
Run `npm run seed` locally with the same env vars (it connects to your MongoDB Atlas directly and creates the admin user). Then log in to your deployed app with `admin` / `Admin@2024`.

## Security features
- ✅ **JWT authentication** (Bearer header)
- ✅ **bcrypt password hashing** (cost 12)
- ✅ **Brute-force protection** (account lock after 5 failed attempts)
- ✅ **Helmet** secure HTTP headers
- ✅ **CORS** whitelisting your frontend URL
- ✅ **express-rate-limit** on auth (15 min / 10 attempts) + heavy AI routes (60 s / 8 generations)
- ✅ **express-validator** input validation
- ✅ **NoSQL injection protection** (strips `$` and `.` from request body keys)
- ✅ **Compression** + **Morgan** logging (dev only)
- ✅ **No plaintext passwords** — hashed via bcrypt before storage
- ✅ **MongoDB Atlas connection caching** for serverless cold-start performance

## Gemini models
Per project spec, the backend uses ONLY:
- **Text**: `gemini-3.5-flash`
- **Image**: `gemini-3.1-flash-image`

If these models are unavailable on your Gemini API account, the API returns a clear 502 error. Update `GEMINI_TEXT_MODEL` / `GEMINI_IMAGE_MODEL` env vars to switch to a different model — no code changes needed.

## Customization
- **Categories**: edit `CATEGORIES` in `src/store/app.ts` and `CATEGORIES` in `server/src/routes/scan.js`
- **Platforms**: edit `PLATFORMS` in `src/store/app.ts` and `server/src/routes/content.js`
- **Color theme**: edit CSS variables in `src/index.css`
- **Brand name / logo**: edit `index.html`, `public/logo.svg`, and `TECHNOVA` text in `login-screen.tsx` / `sidebar.tsx`
