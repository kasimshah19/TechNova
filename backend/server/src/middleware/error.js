/**
 * Centralized error handler. Place last in the middleware chain.
 */
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  const body = {
    error: err.message || 'Internal server error',
  };
  if (!isProd && err.stack) body.stack = err.stack;
  if (err.details) body.details = err.details;

  if (status >= 500) {
    console.error('[error]', err);
  } else if (status >= 400) {
    console.warn('[warn]', err.message);
  }

  res.status(status).json(body);
}

/**
 * 404 handler for unknown routes.
 */
export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Wrap an async route handler so thrown errors go to the error handler.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
