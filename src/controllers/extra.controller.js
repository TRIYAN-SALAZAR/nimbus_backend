import * as extraService from '../services/extra.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

function validarPrecio(precio_actual) {
  return typeof precio_actual === 'number' && precio_actual >= 0;
}

export const listar = asyncHandler(async (req, res) => {
  const soloActivos = req.query.activos !== 'false';
  const data = await extraService.listar({ soloActivos });
  res.json({ ok: true, data });
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await extraService.obtenerPorId(req.params.id);
  res.json({ ok: true, data });
});

export const crear = asyncHandler(async (req, res) => {
  const { nombre, precio_actual } = req.body ?? {};
  if (!nombre) throw new AppError('El campo "nombre" es obligatorio', 400);
  if (!validarPrecio(precio_actual)) {
    throw new AppError('El campo "precio_actual" debe ser un número mayor o igual a cero', 400);
  }

  const data = await extraService.crear({ nombre, precio_actual });
  res.status(201).json({ ok: true, data });
});

export const actualizar = asyncHandler(async (req, res) => {
  const { nombre, precio_actual, activo } = req.body ?? {};
  if (nombre === undefined && precio_actual === undefined && activo === undefined) {
    throw new AppError('Debe enviar al menos un campo para actualizar', 400);
  }
  if (precio_actual !== undefined && !validarPrecio(precio_actual)) {
    throw new AppError('El campo "precio_actual" debe ser un número mayor o igual a cero', 400);
  }
  if (activo !== undefined && typeof activo !== 'boolean') {
    throw new AppError('El campo "activo" debe ser booleano', 400);
  }

  const campos = Object.fromEntries(
    Object.entries({ nombre, precio_actual, activo })
      .filter(([, valor]) => valor !== undefined),
  );
  const data = await extraService.actualizar(req.params.id, campos);
  res.json({ ok: true, data });
});

export const desactivar = asyncHandler(async (req, res) => {
  const data = await extraService.desactivar(req.params.id);
  res.json({ ok: true, data });
});
