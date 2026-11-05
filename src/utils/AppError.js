export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function fromSupabase(error) {
  const statusByCode = {
    PGRST116: 404,
    '23503': 409,
    '23505': 409,
    '23502': 400,
    '23514': 400,
    '22P02': 400,
  };
  const status = statusByCode[error.code] || 400;
  return new AppError(error.message, status, error.details ?? null);
}
