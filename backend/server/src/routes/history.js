import { Router } from 'express';
import Scan from '../models/Scan.js';
import Content from '../models/Content.js';
import Image from '../models/Image.js';
import Code from '../models/Code.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

/**
 * GET /api/history  — combined recent activity.
 * PUBLIC.
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const [scans, contents, images, codes] = await Promise.all([
      Scan.find({}).sort({ createdAt: -1 }).limit(limit).lean(),
      Content.find({}).sort({ createdAt: -1 }).limit(limit).lean(),
      Image.find({}).sort({ createdAt: -1 }).limit(Math.min(limit, 12)).lean(),
      Code.find({}).sort({ createdAt: -1 }).limit(limit).lean(),
    ]);

    res.json({ scans, contents, images, codes });
  })
);

export default router;
