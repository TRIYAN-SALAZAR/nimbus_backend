export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function fromSupabase(error) {
  const status = error.code === 'PGRST116' ? 404 : error.code === '23503' ? 409 : 400;
  return new AppError(error.message, status, error.details ?? null);
}
