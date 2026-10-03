import { Router } from 'express';
import { body } from 'express-validator';
import Scan from '../models/Scan.js';
import { heavyLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/error.js';
import { generateText, safeJsonParse, GeminiError } from '../services/gemini.js';

const router = Router();

export const CATEGORIES = [
  'AI Related',
  'Software',
  'Cybersecurity',
  'Mobile Technology',
  'Cloud & DevOps',
  'Blockchain',
  'Gaming Technology',
  'Gaming',
  'Hardware & Chips',
  'New AI Models / New AI Tools',
];

/**
 * POST /api/gemini/scan
 * Body: { category: string }
 * PUBLIC — no auth required.
 */
router.post(
  '/scan',
  heavyLimiter,
  [body('category').isString().trim().isLength({ min: 2, max: 64 }).withMessage('Category is required.')],
  validate,
  asyncHandler(async (req, res) => {
    const category = String(req.body.category).trim();

    const prompt = `You are a tech news analyst. Analyze the latest 15-20 most relevant and trending topics in the "${category}" category as of today. Return ONLY a JSON array (no markdown fences) of 15-20 items, each item:
{
  "id": "unique slug string",
  "title": "concise headline (max 90 chars)",
  "summary": "2-3 sentence human-written summary (max 280 chars)",
  "publishedAt": "YYYY-MM-DD",
  "trending": boolean,
  "viral": boolean,
  "emerging": boolean,
  "whyTrending": "1-2 sentence reason it's gaining attention",
  "popularityScore": 0-100,
  "sources": ["short source names like 'TechCrunch', 'The Verge', etc."],
  "keywords": ["lowercase short keywords"],
  "contentPotential": "High" | "Medium" | "Low"
}

Rules:
- Prioritize real, current topics from the last 7 days.
- Mix trending, viral, emerging and new launches.
- Do NOT include generic filler; every item must be a real tech topic.
- Return only the JSON array, no other text.`;

    let text;
    try {
      const r = await generateText({ prompt, temperature: 0.4, maxOutputTokens: 8192, responseMimeType: 'application/json' });
      text = r.text;
    } catch (err) {
      if (err instanceof GeminiError) {
        return res.status(err.status || 502).json({ error: err.message });
      }
      throw err;
    }

    const parsed = safeJsonParse(text, null);
    if (!Array.isArray(parsed)) {
      return res.status(502).json({ error: 'AI returned malformed trend data. Try again.' });
    }

    const results = parsed.slice(0, 20).map((item) => ({
      id: String(item.id || `t-${Math.random().toString(36).slice(2, 10)}`),
      title: String(item.title || 'Untitled'),
      summary: String(item.summary || ''),
      publishedAt: String(item.publishedAt || ''),
      trending: Boolean(item.trending),
      viral: Boolean(item.viral),
      emerging: Boolean(item.emerging),
      whyTrending: String(item.whyTrending || ''),
      popularityScore: Math.max(0, Math.min(100, Number(item.popularityScore) || 0)),
      sources: Array.isArray(item.sources) ? item.sources.slice(0, 8).map(String) : [],
      keywords: Array.isArray(item.keywords) ? item.keywords.slice(0, 12).map(String) : [],
      contentPotential: ['High', 'Medium', 'Low'].includes(item.contentPotential) ? item.contentPotential : 'Medium',
    }));

    const scan = await Scan.create({
      category,
      results,
      filter: 'all',
    });

    res.json({ id: scan._id, results });
  })
);

/**
 * GET /api/gemini/scans  — list recent scans (most recent first)
 * PUBLIC.
 */
router.get(
  '/scans',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const scans = await Scan.find({}).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ scans });
  })
);

/**
 * GET /api/gemini/scans/:id
 * PUBLIC.
 */
router.get(
  '/scans/:id',
  asyncHandler(async (req, res) => {
    const scan = await Scan.findOne({ _id: req.params.id }).lean();
    if (!scan) return res.status(404).json({ error: 'Scan not found.' });
    res.json({ scan });
  })
);

export default router;
