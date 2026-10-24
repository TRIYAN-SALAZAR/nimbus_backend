import * as productoService from '../services/producto.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const listar = asyncHandler(async (req, res) => {
  const soloActivos = req.query.activos !== 'false';
  const data = await productoService.listar({ soloActivos });
  res.json({ ok: true, data });
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await productoService.obtenerPorId(req.params.id);
  res.json({ ok: true, data });
});

export const crear = asyncHandler(async (req, res) => {
  const { nombre, categoria } = req.body;
  if (!nombre) throw new AppError('El campo "nombre" es obligatorio', 400);

  const data = await productoService.crear({ nombre, categoria });
  res.status(201).json({ ok: true, data });
});

export const actualizar = asyncHandler(async (req, res) => {
  const { nombre, categoria, activo } = req.body;
  const data = await productoService.actualizar(req.params.id, { nombre, categoria, activo });
  res.json({ ok: true, data });
});

export const desactivar = asyncHandler(async (req, res) => {
  const data = await productoService.desactivar(req.params.id);
  res.json({ ok: true, data });
});
