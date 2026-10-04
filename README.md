# TechNova — AI Tech News & Content Generation Platform (MERN Stack)

A production-grade MERN-stack web application that lets an admin log in, scan the latest tech trends per category, generate humanized platform-specific content (Facebook, Instagram, LinkedIn, Pinterest, Threads, Twitter/X, Reddit, Blog), generate AI images, and generate code from prompts — all powered by Google Gemini.

Built for deployment on Vercel (Frontend) and Render (Backend).

## The Problem
Staying updated with rapidly changing tech trends and creating engaging, platform-specific content is incredibly time-consuming. Tech influencers, digital agencies, and developers often struggle to maintain an active presence across multiple platforms (Twitter, LinkedIn, Instagram, etc.) while also needing to generate code snippets or visual assets for their blogs and posts. Managing multiple disconnected AI tools for these tasks breaks workflow and reduces productivity.

## The Solution We Provided
TechNova provides an all-in-one AI-powered centralized dashboard that solves this fragmentation. We built a system that:
1. **Automates Tech Trend Discovery**: Scans and summarizes the latest tech news across various categories (AI, Web3, Cybersecurity, etc.) in real-time using Gemini.
2. **Generates Platform-Specific Content**: Takes a single prompt or news topic and automatically tailors the tone, length, and format for 8+ different social platforms (e.g., professional for LinkedIn, short and hashtag-heavy for Twitter/X).
3. **Creates Visual Assets**: Includes a prompt-to-image generator for creating custom thumbnails and post graphics.
4. **Writes Code**: Features a dedicated coding assistant to generate syntax-highlighted code snippets for technical blogs.
5. **Maintains Historical Records**: Everything generated is saved to a database, allowing admins to track past campaigns and reuse content.

By centralizing these capabilities into one secure platform, we drastically reduce the time and effort required to run a tech-focused digital presence.

## Detailed Technology Stack
We engineered a robust, production-ready MERN stack application optimized for cloud deployment:

**Frontend (Client)**
- **React 18 & Vite**: For lightning-fast Hot Module Replacement (HMR) during development and optimized static builds.
- **TypeScript**: Ensures type safety and reduces runtime errors across the UI.
- **Tailwind CSS & shadcn/ui**: Used to build a highly responsive, premium, dark-mode focused UI with modern glassmorphism effects.
- **Framer Motion & CSS Animations**: Powers 15+ custom premium animations (e.g., Staggered Menus, Magic Bentos, Hover Cards) for a dynamic user experience.
- **Zustand**: Provides lightweight, scalable global state management without the boilerplate of Redux.
- **React Router DOM**: Handles secure routing and protected layout boundaries.

**Backend (API Server)**
- **Node.js & Express**: A lightweight, scalable backend framework handling REST API requests.
- **MongoDB Atlas & Mongoose**: A cloud-hosted NoSQL database for flexible document storage, complete with connection caching.
- **JSON Web Tokens (JWT) & bcrypt**: Manages stateless authentication and securely hashes passwords.
- **Security Middleware**: Incorporates `helmet` (HTTP headers), `cors`, `express-rate-limit` (brute-force & API quota protection), and NoSQL injection sanitizers.

**Artificial Intelligence**
- **Google Gemini REST API**: 
  - `gemini-3.5-flash`: Powers fast, high-quality text generation for news scanning, social media content, and code generation.
  - `gemini-3.1-flash-image`: Powers the text-to-image generation engine.

**Deployment & DevOps**
- **Vercel**: Hosts the React frontend on its global Edge Network for maximum static asset delivery speed.
- **Render**: Hosts the Node.js/Express backend as a persistent web service to handle heavy AI proxying and database connections without serverless cold-start timeouts.
- **GitHub**: Source control and continuous deployment triggers.

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

---

## 👨‍💻 Author
**Kasim Shah**

Connect with me:
- **Portfolio**: [kasim-portfolio-umber.vercel.app](https://kasim-portfolio-umber.vercel.app/)
- **LinkedIn**: [Kasim Shah](https://www.linkedin.com/in/kasim-shah-176175340/)
- **GitHub**: [@kasimshah19](https://github.com/kasimshah19)

<br/>
<div align="center">
  &copy; 2026 TechNova — All rights reserved.
</div>
