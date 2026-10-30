import * as origenPagoService from '../services/origen-pago.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await origenPagoService.listar();
  res.json({ ok: true, data });
});

export const crear = asyncHandler(async (req, res) => {
  const { nombre, tipo } = req.body;
  if (!nombre) throw new AppError('El campo "nombre" es obligatorio', 400);
  if (!tipo) throw new AppError('El campo "tipo" es obligatorio', 400);

  const data = await origenPagoService.crear({ nombre, tipo });
  res.status(201).json({ ok: true, data });
});

export const actualizar = asyncHandler(async (req, res) => {
  const { nombre, tipo, activo } = req.body;
  const data = await origenPagoService.actualizar(req.params.id, { nombre, tipo, activo });
  res.json({ ok: true, data });
});

export const eliminar = asyncHandler(async (req, res) => {
  const data = await origenPagoService.eliminar(req.params.id);
  res.json({ ok: true, data });
});
