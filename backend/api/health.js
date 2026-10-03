// Vercel serverless entry — handles /api/health specifically
process.env.VERCEL = '1';

const VERSION = 'v3-health-direct';

export default async function handler(req, res) {
  console.log('[api/health]', VERSION, req.method, 'url:', req.url);
  return res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
    vercel: true,
    version: VERSION,
    mode: 'direct',
    url: req.url,
    method: req.method,
  });
}
