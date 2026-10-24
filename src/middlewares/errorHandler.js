import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ ok: false, error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    ok: false,
    error: status >= 500 && env.nodeEnv === 'production' ? 'Error interno del servidor' : err.message,
    ...(err.details && { details: err.details }),
  });
}
