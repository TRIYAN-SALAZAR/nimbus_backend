import * as stockService from '../services/stock.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await stockService.listar();
  res.json({ ok: true, data });
});
