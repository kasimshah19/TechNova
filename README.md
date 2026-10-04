# TechNova — AI Tech News & Content Generation Platform (MERN Stack)

A production-grade MERN-stack web application that lets an admin log in, scan the latest tech trends per category, generate humanized platform-specific content (Facebook, Instagram, LinkedIn, Pinterest, Threads, Twitter/X, Reddit, Blog), generate AI images, and generate code from prompts — all powered by Google Gemini.

Built for deployment on Vercel (Frontend) and Render (Backend).

## 🚀 Live Demo & Credentials
To test the live application, use the following credentials to access the admin dashboard:

| Role | Application URL | Username | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | [Live Vercel App](https://tech-nova-fawn-phi.vercel.app/) | `admin` | `Admin@2024` |

---

## The Core Problem
In the fast-paced world of digital media and software development, staying relevant requires constant vigilance and continuous content creation. Tech influencers, digital marketing agencies, startup founders, and developer advocates often face a significant bottleneck: context switching. 
1. **Information Overload**: Tracking breaking news across AI, Web3, Cybersecurity, and Software Engineering requires manually checking dozens of sources daily.
2. **Platform Fragmentation**: Writing a single article is not enough. Content must be repurposed for Twitter (short, hashtag-driven), LinkedIn (professional, formatted), Instagram (visual-first), and Reddit (community-focused). 
3. **Tool Fatigue**: Creators currently juggle multiple tabs and subscriptions—ChatGPT for text, Midjourney for images, GitHub Copilot for code snippets, and social media managers for scheduling. 
4. **Loss of Historical Data**: Tracking what was generated, when, and for which platform often gets lost in copy-paste workflows, making it difficult to analyze past successful campaigns or reuse content.

## The Solution We Provided
TechNova was engineered from the ground up as a comprehensive, AI-powered central nervous system for tech professionals. It eliminates tool fatigue by unifying four major workflows into a single, highly secure MERN-stack dashboard.

1. **Automated Tech Trend Discovery & Scanning**: 
   - Instead of manually browsing news sites, the user clicks a button to scan categories like "Artificial Intelligence" or "Web Development."
   - The system leverages Google Gemini to aggregate, filter, and summarize the most impactful, real-time trends into digestible insights.
   
2. **Multi-Platform Content Engine**: 
   - Users can select a specific topic (or use a scanned trend) and choose from 8+ social platforms.
   - The backend dynamically constructs strict system prompts tailored to the selected platform's algorithm. For example, a LinkedIn request will generate structured paragraphs with professional hooks, while a Twitter/X request will generate a concise, 280-character thread with optimal emojis and hashtags.

3. **Integrated Visual Asset Creation**: 
   - A dedicated prompt-to-image pipeline powered by Gemini's multimodal image models (`gemini-3.1-flash-image`). 
   - Users can generate high-quality thumbnails, blog headers, and social media graphics directly within the same UI, preventing the need to export text and jump to a separate image tool.

4. **Dedicated Code Generation Assistant**: 
   - A specialized module tailored for developers writing technical blogs. 
   - It forces the AI to output strict, syntactically correct code blocks in markdown, which the frontend automatically renders using `react-syntax-highlighter` for immediate readability.

5. **Persistent Historical Auditing**: 
   - Every single generation (Content, Image, Code, and Scan) is tied to the authenticated user's `ObjectId` and saved to MongoDB.
   - A central History Dashboard allows the admin to review, manage, and delete past generations, ensuring no valuable content is ever lost.

## Detailed Technology Stack & Architecture

We architected TechNova using a modern, scalable MERN stack (MongoDB, Express, React, Node.js), heavily optimized for cloud environments and distributed deployment.

### 1. Frontend Architecture (Client-Side)
- **React 18 & Vite**: Chosen for lightning-fast Hot Module Replacement (HMR) during local development and highly optimized, minified static assets during production builds.
- **TypeScript**: Enforces strict static typing across the entire frontend, ensuring that API responses perfectly match expected component interfaces, drastically reducing runtime crashes.
- **Tailwind CSS v3**: Utility-first CSS framework used to build a highly responsive, pixel-perfect UI. It enables rapid styling without leaving the component file.
- **shadcn/ui & Radix Primitives**: Provides accessible, unstyled UI components (like Modals, Dropdowns, and Toasts) that are heavily customized to fit our dark-mode, glassmorphism aesthetic.
- **Framer Motion**: Powers 15+ custom premium animations. From the `StaggeredMenu` and `MagicBento` grids to complex page transitions, it ensures the application feels dynamic, premium, and alive.
- **Zustand**: Selected over Redux for global state management due to its minimal boilerplate. It efficiently manages the `AuthStore` (JWT tokens, user profiles) and `AppStore` (UI loading states, active categories).
- **React Router DOM**: Handles secure client-side routing. It includes an `AuthGuard` component that protects sensitive dashboard routes, instantly redirecting unauthenticated traffic to the login screen.

### 2. Backend Architecture (API Server)
- **Node.js & Express**: A lightweight, scalable backend framework that acts as the secure middleman between the client, the database, and the external AI APIs.
- **MongoDB Atlas & Mongoose**: A cloud-hosted NoSQL database. We utilized Mongoose ODM to enforce strict schemas for `User`, `Content`, `Image`, and `Code` models. The backend includes smart connection caching to prevent connection pool exhaustion during serverless cold starts.
- **JSON Web Tokens (JWT)**: Implements stateless, secure authentication. Tokens are signed with a highly secure secret, expire after 24 hours, and are required in the `Authorization: Bearer <token>` header for all protected API routes.
- **bcrypt**: Ensures all user passwords are cryptographically hashed with a salt factor of 12 before ever touching the database, protecting against rainbow-table attacks.
- **Defense-in-Depth Security Middleware**:
  - `helmet`: Automatically sets 11+ critical HTTP security headers (XSS filtering, HSTS, frameguard).
  - `cors`: Strictly configured to only accept incoming requests from our specific Vercel frontend domain.
  - `express-rate-limit`: Implements multiple limits (e.g., maximum 10 login attempts per 15 minutes to stop brute-force attacks, and API quotas to prevent users from racking up huge Google Cloud bills).
  - **NoSQL Sanitization**: Strips dangerous characters (`$` and `.`) from incoming JSON bodies to prevent MongoDB injection attacks.

### 3. Artificial Intelligence Integration
- **Google Gemini REST API**: The core brain of the platform.
  - **Text Generation (`gemini-3.5-flash`)**: Chosen for its incredible speed and low latency. It handles the heavy lifting of summarizing news, writing social media posts, and generating complex code snippets.
  - **Image Generation (`gemini-3.1-flash-image`)**: Utilized for the prompt-to-image pipeline, returning high-fidelity Base64 image data directly to the client.

### 4. Distributed Cloud Deployment
- **Vercel (Frontend)**: Hosts the compiled React static files on its global Edge Network (CDN). This ensures that users worldwide load the initial UI payload in milliseconds.
- **Render (Backend)**: Hosts the Node.js/Express API as a persistent Web Service. Unlike Vercel Serverless functions (which kill connections after 10 seconds on the free tier), Render keeps the process alive. This is critical because AI generation requests to Gemini and heavy MongoDB aggregations can sometimes take longer than standard serverless timeouts.
- **GitHub**: Acts as the single source of truth for version control, wired directly into Vercel and Render for automated CI/CD deployments on every push to the `main` branch.

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
