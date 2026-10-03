import { Router } from 'express';
import { body } from 'express-validator';
import Image from '../models/Image.js';
import { heavyLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/error.js';
import { generateImage, GeminiError } from '../services/gemini.js';

const router = Router();

/**
 * POST /api/gemini/image
 * Body: { prompt: string }
 * PUBLIC.
 */
router.post(
  '/image',
  heavyLimiter,
  [body('prompt').isString().trim().isLength({ min: 3, max: 1000 }).withMessage('Prompt is required (3-1000 chars).')],
  validate,
  asyncHandler(async (req, res) => {
    const prompt = String(req.body.prompt).trim();
    try {
      const { image, alt, model } = await generateImage(prompt);
      const doc = await Image.create({ prompt, image, alt, model });
      res.json({ id: doc._id, image, alt, model });
    } catch (err) {
      if (err instanceof GeminiError) return res.status(err.status || 502).json({ error: err.message });
      throw err;
    }
  })
);

/**
 * GET /api/gemini/images  — most recent images
 * PUBLIC.
 */
router.get(
  '/images',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 12, 50);
    const list = await Image.find({}).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ images: list });
  })
);

export default router;
