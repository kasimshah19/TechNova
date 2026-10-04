import './config/env.js';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/error.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { sanitizeInput } from './middleware/validate.js';
import scanRoutes from './routes/scan.js';
import contentRoutes from './routes/content.js';
import imageRoutes from './routes/image.js';
import codeRoutes from './routes/code.js';
import historyRoutes from './routes/history.js';

const isVercel = !!process.env.VERCEL || !!process.env.NOW_REGION;

/**
 * Create the Express app.
 * Exported separately so Vercel can import it as a serverless handler.
 * NO AUTH — all APIs are public.
 */
export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  // CORS — public, allow all origins
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    })
  );

  // Basic security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Body parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // NoSQL injection sanitization (strips $ and . from keys)
  app.use((req, _res, next) => {
    if (req.body) req.body = sanitizeInput(req.body);
    next();
  });

  // Rate limit (only on non-Vercel)
  if (!isVercel) {
    app.use('/api', apiLimiter);
  }

  // Health check (no DB)
  app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString(), vercel: isVercel }));

  // Public API routes (NO AUTH)
  app.use('/api/gemini', scanRoutes);
  app.use('/api/gemini', contentRoutes);
  app.use('/api/gemini', imageRoutes);
  app.use('/api/gemini', codeRoutes);
  app.use('/api/history', historyRoutes);

  // 404 + error handler (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

/**
 * Boot the app standalone (npm run dev / npm start).
 */
export async function startServer() {
  const morgan = (await import('morgan')).default;
  const compression = (await import('compression')).default;
  const helmet = (await import('helmet')).default;

  const app = createApp();
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(morgan('tiny'));

  const port = Number(process.env.PORT) || 5000;

  try {
    await connectDB();
  } catch (err) {
    console.warn('[startup] DB connection failed — continuing without DB:', err.message);
  }

  return app.listen(port, () => {
    console.log(`[server] TechNova API listening on http://localhost:${port}`);
  });
}

const isMain = !process.env.VERCEL && process.argv[1] && process.argv[1].endsWith('index.js');
if (isMain) {
  startServer().catch((err) => {
    console.error('[startup] fatal:', err);
    process.exit(1);
  });
}

export default createApp;
