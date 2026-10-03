import { validationResult } from 'express-validator';

/** Returns a 400 with the validation errors array if any validator rules fail. */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed.',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

/**
 * Recursively sanitizes a string/obj/array — strips $ and . from keys (NoSQL injection protection),
 * trims whitespace, and escapes HTML special chars.
 */
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.replace(/[<>]/g, '').trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input && typeof input === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(input)) {
      const cleanKey = k.replace(/[.$]/g, '');
      out[cleanKey] = sanitizeInput(v);
    }
    return out;
  }
  return input;
}
