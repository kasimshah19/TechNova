// Vercel serverless entry — catch-all fallback for any /api/* not handled by specific functions
process.env.VERCEL = '1';

const VERSION = 'v3-catchall';

let cachedApp = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  const mod = await import('../server/src/index.js');
  cachedApp = mod.createApp();
  return cachedApp;
}

export default async function handler(req, res) {
  console.log('[api-catchall]', VERSION, req.method, 'url:', req.url);

  try {
    const app = await getApp();

    // Normalize URL to /api/... so Express routes match.
    if (!req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
      console.log('[api-catchall] normalized url to:', req.url);
    }

    return app(req, res);
  } catch (err) {
    console.error('[api-catchall] fatal:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err?.message || 'Unknown error',
      stack: err?.stack,
      version: VERSION,
    });
  }
}
