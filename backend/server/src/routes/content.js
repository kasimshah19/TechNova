import { Router } from 'express';
import { body } from 'express-validator';
import Content from '../models/Content.js';
import { heavyLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/error.js';
import { generateText, GeminiError } from '../services/gemini.js';
import { generatePostingTime } from './postingTime.js';

const router = Router();

export const PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'Pinterest', 'Threads', 'Twitter/X', 'Reddit', 'Blog'];

function platformPrompt(platform, topic, summary = '') {
  const base = `Topic: ${topic}${summary ? `\nSummary: ${summary}` : ''}`;
  const humanizationRules = `Rules for ALL platforms:
- Write like a real human, never like a bot.
- NO long em-dashes, NO "—".
- NO robotic hooks like "In today's fast-paced world" or "Did you know that...".
- NO emoji spam — use at most ONE emoji, only if it fits naturally.
- NO AI clichés ("unlock", "delve", "navigate the landscape", "in the realm of").
- Be specific, conversational, and useful.`;

  switch (platform) {
    case 'Instagram':
      return `${base}\n\nGenerate Instagram content as JSON ONLY:
{
  "hook": "scroll-stopping 1-line hook (max 100 chars, NO emoji)",
  "caption": "human-written 80-220 word caption with paragraph breaks (\\n\\n), one tasteful emoji max if it fits",
  "hashtags": ["8-12 relevant hashtags without # prefix"],
  "seoKeywords": ["4-6 lowercase SEO keywords"],
  "cta": "single clear CTA (e.g. 'Save this post for later')"
}
${humanizationRules}`;

    case 'LinkedIn':
      return `${base}\n\nGenerate LinkedIn content as JSON ONLY:
{
  "openingHook": "professional but human 1-2 line opening hook",
  "body": "120-260 word body with proper paragraph breaks (\\n\\n), useful insight, real talk",
  "cta": "single CTA",
  "hashtags": ["4-6 hashtags without # prefix"],
  "seoKeywords": ["4-6 SEO keywords"]
}
${humanizationRules}`;

    case 'Pinterest':
      return `${base}\n\nGenerate Pinterest content as JSON ONLY:
{
  "title": "SEO-friendly title (60-100 chars, includes the topic keyword)",
  "description": "SEO-friendly 80-180 word description with 1-2 natural paragraph breaks",
  "keywords": ["6-10 lowercase keywords"],
  "tags": ["6-10 lowercase tags"],
  "hashtags": ["4-8 hashtags without # prefix"],
  "cta": "single CTA"
}
${humanizationRules}`;

    case 'Twitter/X':
      return `${base}\n\nGenerate Twitter/X content as JSON ONLY:
{
  "text": "concise 1-2 tweet thread or single tweet (max 280 chars combined for the first tweet, conversational, no spam hashtags)",
  "hashtags": ["0-3 hashtags without # prefix"],
  "seoKeywords": ["3-5 SEO keywords"]
}
${humanizationRules}`;

    case 'Reddit':
      return `${base}\n\nGenerate Reddit content as JSON ONLY:
{
  "title": "genuine-sounding Reddit post title (max 300 chars, no marketing tone, no emojis)",
  "subreddit": "best matching subreddit name (no r/ prefix)",
  "body": "self-post body 100-400 words, conversational, asking a real question or sharing insight"
}
${humanizationRules}`;

    case 'Facebook':
      return `${base}\n\nGenerate Facebook content as JSON ONLY:
{
  "text": "human 100-220 word post with paragraph breaks (\\n\\n), one emoji max",
  "cta": "single CTA",
  "hashtags": ["3-6 hashtags without # prefix"]
}
${humanizationRules}`;

    case 'Threads':
      return `${base}\n\nGenerate Threads content as JSON ONLY:
{
  "text": "conversational 100-280 chars, casual tone, no more than one emoji",
  "hashtags": ["0-3 hashtags without # prefix"]
}
${humanizationRules}`;

    case 'Blog':
      return `${base}\n\nGenerate Blog content as JSON ONLY:
{
  "title": "SEO-friendly H1 title (50-80 chars)",
  "metaDescription": "120-160 char meta description",
  "headings": ["4-7 H2/H3 headings in order"],
  "primaryKeyword": "the main SEO keyword",
  "secondaryKeywords": ["4-6 secondary keywords"],
  "body": "600-1200 word markdown body with proper ## headings, paragraph breaks, no em-dashes, natural keyword placement",
  "cta": "single CTA",
  "faqs": [{"q": "question", "a": "60-120 word answer"}, ...3-5 FAQs]
}
${humanizationRules}`;

    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

/**
 * POST /api/gemini/content
 * Body: { topic: string, summary?: string, platform: string }
 * PUBLIC — no auth.
 */
router.post(
  '/content',
  heavyLimiter,
  [
    body('topic').isString().trim().isLength({ min: 3, max: 300 }).withMessage('Topic is required.'),
    body('platform').isString().isIn(PLATFORMS).withMessage('Invalid platform.'),
    body('summary').optional().isString().isLength({ max: 2000 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { topic, summary = '', platform } = req.body;

    const prompt = platformPrompt(platform, topic, summary);
    let text;
    try {
      const r = await generateText({ prompt, temperature: 0.7, maxOutputTokens: 8192, responseMimeType: 'application/json' });
      text = r.text;
    } catch (err) {
      if (err instanceof GeminiError) return res.status(err.status || 502).json({ error: err.message });
      throw err;
    }

    let data;
    try {
      let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
      const first = cleaned.indexOf('{');
      const last = cleaned.lastIndexOf('}');
      if (first !== -1 && last !== -1) cleaned = cleaned.slice(first, last + 1);
      data = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ error: 'AI returned malformed content. Try again.' });
    }

    let postingTime = null;
    try {
      postingTime = await generatePostingTime(topic, platform);
    } catch {
      /* non-fatal */
    }

    const content = await Content.create({
      topic,
      summary,
      platform,
      data,
      postingTime,
    });

    res.json({ id: content._id, data, postingTime });
  })
);

/**
 * GET /api/gemini/contents  — list recent generated content
 * PUBLIC.
 */
router.get(
  '/contents',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const list = await Content.find({}).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ contents: list });
  })
);

export default router;
