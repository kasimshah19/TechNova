// Vercel serverless entry — handles ALL /api/gemini/* requests
process.env.VERCEL = '1';

const VERSION = 'v3-gemini-direct';

let cachedApp = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  const mod = await import('../../server/src/index.js');
  cachedApp = mod.createApp();
  return cachedApp;
}

export default async function handler(req, res) {
  console.log('[api/gemini]', VERSION, req.method, 'url:', req.url);

  try {
    const app = await getApp();

    // Normalize URL to /api/gemini/...
    let url = req.url;
    if (!url.startsWith('/api/gemini')) {
      url = '/api/gemini' + (url.startsWith('/') ? url : '/' + url);
      req.url = url;
      console.log('[api/gemini] normalized url to:', req.url);
    }

    return app(req, res);
  } catch (err) {
    console.error('[api/gemini] fatal:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err?.message || 'Unknown error',
      stack: err?.stack,
      version: VERSION,
    });
  }
}
