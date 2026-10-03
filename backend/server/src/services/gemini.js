/**
 * Gemini API helper — server-side only.
 * Uses ONLY the user-specified models:
 *   - text/analysis:  gemini-3.5-flash
 *   - image:          gemini-3.1-flash-image
 * If those are unavailable (model not found / quota / region), the helper returns a
 * graceful error to the caller. The caller decides how to handle it.
 */

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const API_KEY = process.env.GEMINI_API_KEY;

export class GeminiError extends Error {
  constructor(message, { status, model } = {}) {
    super(message);
    this.name = 'GeminiError';
    this.status = status || 502;
    this.model = model;
  }
}

export function isConfigured() {
  return Boolean(API_KEY && TEXT_MODEL && IMAGE_MODEL);
}

export async function generateText({ prompt, temperature = 0.7, maxOutputTokens = 8192, responseMimeType = 'application/json', systemPrompt }) {
  if (!isConfigured()) throw new GeminiError('Gemini API is not configured (GEMINI_API_KEY missing).', { status: 500 });

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens, responseMimeType },
  };
  if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] };

  const res = await fetch(`${API_BASE}/${TEXT_MODEL}:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Gemini API error (status ${res.status})`;
    throw new GeminiError(msg, { status: res.status, model: TEXT_MODEL });
  }
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || '').join('').trim();
  if (!text) throw new GeminiError('Gemini returned an empty response.', { status: 502, model: TEXT_MODEL });
  return { text, model: TEXT_MODEL };
}

export async function generateImage(prompt) {
  if (!isConfigured()) throw new GeminiError('Gemini API is not configured (GEMINI_API_KEY missing).', { status: 500 });

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  };

  const res = await fetch(`${API_BASE}/${IMAGE_MODEL}:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Gemini image API error (status ${res.status})`;
    throw new GeminiError(msg, { status: res.status, model: IMAGE_MODEL });
  }
  const parts = data?.candidates?.[0]?.content?.parts || [];
  let altText = '';
  for (const p of parts) {
    if (p.inlineData?.data) {
      const mime = p.inlineData.mimeType || 'image/png';
      return {
        image: `data:${mime};base64,${p.inlineData.data}`,
        alt: altText || `Generated image for: ${prompt.slice(0, 80)}`,
        model: IMAGE_MODEL,
      };
    }
    if (p.text) altText = p.text;
  }
  throw new GeminiError('Gemini image API returned no image data.', { status: 502, model: IMAGE_MODEL });
}

/** Best-effort JSON parser for AI responses that may include ```json fences. */
export function safeJsonParse(text, fallback = null) {
  if (!text) return fallback;
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    cleaned = cleaned.slice(first, last + 1);
  } else {
    const firstArr = cleaned.indexOf('[');
    const lastArr = cleaned.lastIndexOf(']');
    if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
      cleaned = cleaned.slice(firstArr, lastArr + 1);
    }
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}
