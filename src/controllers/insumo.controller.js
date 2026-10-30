import * as insumoService from '../services/insumo.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const listar = asyncHandler(async (req, res) => {
  const soloActivos = req.query.activos !== 'false';
  const data = await insumoService.listar({ soloActivos });
  res.json({ ok: true, data });
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await insumoService.obtenerPorId(req.params.id);
  res.json({ ok: true, data });
});

export const crear = asyncHandler(async (req, res) => {
  const { nombre, unidad_medida, stock_minimo } = req.body ?? {};
  if (!nombre) throw new AppError('El campo "nombre" es obligatorio', 400);
  if (!unidad_medida) throw new AppError('El campo "unidad_medida" es obligatorio', 400);
  if (stock_minimo !== undefined && (typeof stock_minimo !== 'number' || stock_minimo < 0)) {
    throw new AppError('El campo "stock_minimo" debe ser un número mayor o igual a cero', 400);
  }

  const data = await insumoService.crear({ nombre, unidad_medida, stock_minimo });
  res.status(201).json({ ok: true, data });
});

export const actualizar = asyncHandler(async (req, res) => {
  const { nombre, unidad_medida, stock_minimo, activo } = req.body ?? {};
  if (nombre === undefined && unidad_medida === undefined && stock_minimo === undefined && activo === undefined) {
    throw new AppError('Debe enviar al menos un campo para actualizar', 400);
  }
  if (stock_minimo !== undefined && (typeof stock_minimo !== 'number' || stock_minimo < 0)) {
    throw new AppError('El campo "stock_minimo" debe ser un número mayor o igual a cero', 400);
  }
  if (activo !== undefined && typeof activo !== 'boolean') {
    throw new AppError('El campo "activo" debe ser booleano', 400);
  }

  const campos = Object.fromEntries(
    Object.entries({ nombre, unidad_medida, stock_minimo, activo })
      .filter(([, valor]) => valor !== undefined),
  );
  const data = await insumoService.actualizar(req.params.id, campos);
  res.json({ ok: true, data });
});

export const desactivar = asyncHandler(async (req, res) => {
  const data = await insumoService.desactivar(req.params.id);
  res.json({ ok: true, data });
});
