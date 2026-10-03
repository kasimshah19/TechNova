import { Router } from 'express';
import { body } from 'express-validator';
import Code from '../models/Code.js';
import { heavyLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/error.js';
import { generateText, GeminiError } from '../services/gemini.js';

const router = Router();

/**
 * POST /api/gemini/code
 * Body: { prompt: string, language?: string }
 * PUBLIC.
 */
router.post(
  '/code',
  heavyLimiter,
  [
    body('prompt').isString().trim().isLength({ min: 3, max: 2000 }).withMessage('Prompt is required (3-2000 chars).'),
    body('language').optional().isString().isLength({ max: 64 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const prompt = String(req.body.prompt).trim();
    const language = req.body.language ? String(req.body.language).trim() : '';

    const systemPrompt = 'You are a senior software engineer. Generate clean, production-ready code that matches the user request. Return ONLY a JSON object with keys: code, language, explanation.';
    const userMsg = `Request: ${prompt}${language ? `\nPreferred language: ${language}` : '\nDetect the most appropriate language.'}

Return ONLY JSON:
{
  "code": "the full code as a single string, no markdown fences",
  "language": "the programming language you used (lowercase, e.g. javascript, python, typescript)",
  "explanation": "2-4 sentence plain-English explanation of what the code does and how to use it"
}`;

    let text;
    try {
      const r = await generateText({
        prompt: userMsg,
        systemPrompt,
        temperature: 0.3,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      });
      text = r.text;
    } catch (err) {
      if (err instanceof GeminiError) return res.status(err.status || 502).json({ error: err.message });
      throw err;
    }

    let parsed;
    try {
      let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
      const first = cleaned.indexOf('{');
      const last = cleaned.lastIndexOf('}');
      if (first !== -1 && last !== -1) cleaned = cleaned.slice(first, last + 1);
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ error: 'AI returned malformed code response. Try again.' });
    }

    const doc = await Code.create({
      prompt,
      language,
      result: {
        code: String(parsed.code || ''),
        language: String(parsed.language || language || 'unknown'),
        explanation: String(parsed.explanation || ''),
      },
    });

    res.json({ id: doc._id, result: doc.result });
  })
);

/**
 * GET /api/gemini/codes  — recent code generations
 * PUBLIC.
 */
router.get(
  '/codes',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const list = await Code.find({}).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ codes: list });
  })
);

export default router;
