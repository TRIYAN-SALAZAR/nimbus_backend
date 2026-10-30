import * as metodoPagoService from '../services/metodo-pago.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await metodoPagoService.listar();
  res.json({ ok: true, data });
});

export const crear = asyncHandler(async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) throw new AppError('El campo "nombre" es obligatorio', 400);

  const data = await metodoPagoService.crear({ nombre });
  res.status(201).json({ ok: true, data });
});
