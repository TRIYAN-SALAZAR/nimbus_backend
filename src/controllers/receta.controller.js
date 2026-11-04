import * as recetaService from '../services/receta.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

function validarCantidad(cantidad_consumida) {
  return typeof cantidad_consumida === 'number' && cantidad_consumida > 0;
}

export const listarPorVariante = asyncHandler(async (req, res) => {
  const data = await recetaService.listarPorVariante(req.params.id_variante);
  res.json({ ok: true, data });
});

export const agregarAVariante = asyncHandler(async (req, res) => {
  const { id_insumo, cantidad_consumida, solo_para_llevar } = req.body ?? {};
  if (id_insumo === undefined) {
    throw new AppError('El campo "id_insumo" es obligatorio', 400);
  }
  if (!validarCantidad(cantidad_consumida)) {
    throw new AppError('El campo "cantidad_consumida" debe ser un número mayor que cero', 400);
  }
  if (solo_para_llevar !== undefined && typeof solo_para_llevar !== 'boolean') {
    throw new AppError('El campo "solo_para_llevar" debe ser booleano', 400);
  }

  const data = await recetaService.agregarAVariante({
    id_variante: req.params.id_variante,
    id_insumo,
    cantidad_consumida,
    solo_para_llevar,
  });
  res.status(201).json({ ok: true, data });
});

export const quitarDeVariante = asyncHandler(async (req, res) => {
  const data = await recetaService.quitarDeVariante(
    req.params.id_variante,
    req.params.id_insumo,
  );
  res.json({ ok: true, data });
});

export const listarPorExtra = asyncHandler(async (req, res) => {
  const data = await recetaService.listarPorExtra(req.params.id_extra);
  res.json({ ok: true, data });
});

export const agregarAExtra = asyncHandler(async (req, res) => {
  const { id_insumo, cantidad_consumida } = req.body ?? {};
  if (id_insumo === undefined) {
    throw new AppError('El campo "id_insumo" es obligatorio', 400);
  }
  if (!validarCantidad(cantidad_consumida)) {
    throw new AppError('El campo "cantidad_consumida" debe ser un número mayor que cero', 400);
  }

  const data = await recetaService.agregarAExtra({
    id_extra: req.params.id_extra,
    id_insumo,
    cantidad_consumida,
  });
  res.status(201).json({ ok: true, data });
});

export const quitarDeExtra = asyncHandler(async (req, res) => {
  const data = await recetaService.quitarDeExtra(
    req.params.id_extra,
    req.params.id_insumo,
  );
  res.json({ ok: true, data });
});
