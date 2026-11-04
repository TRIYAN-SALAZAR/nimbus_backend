import * as varianteService from '../services/variante.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

function validarPrecio(precio_actual) {
  return typeof precio_actual === 'number' && precio_actual > 0;
}

export const listar = asyncHandler(async (req, res) => {
  const soloActivos = req.query.activos !== 'false';
  const idProducto = req.query.id_producto;
  const data = await varianteService.listar({ soloActivos, idProducto });
  res.json({ ok: true, data });
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await varianteService.obtenerPorId(req.params.id);
  res.json({ ok: true, data });
});

export const crear = asyncHandler(async (req, res) => {
  const { id_producto, tamano, precio_actual } = req.body ?? {};
  if (id_producto === undefined) {
    throw new AppError('El campo "id_producto" es obligatorio', 400);
  }
  if (!validarPrecio(precio_actual)) {
    throw new AppError('El campo "precio_actual" debe ser un número mayor que cero', 400);
  }

  const data = await varianteService.crear({ id_producto, tamano, precio_actual });
  res.status(201).json({ ok: true, data });
});

export const actualizar = asyncHandler(async (req, res) => {
  const { id_producto, tamano, precio_actual, activo } = req.body ?? {};
  if (
    id_producto === undefined
    && tamano === undefined
    && precio_actual === undefined
    && activo === undefined
  ) {
    throw new AppError('Debe enviar al menos un campo para actualizar', 400);
  }
  if (precio_actual !== undefined && !validarPrecio(precio_actual)) {
    throw new AppError('El campo "precio_actual" debe ser un número mayor que cero', 400);
  }
  if (activo !== undefined && typeof activo !== 'boolean') {
    throw new AppError('El campo "activo" debe ser booleano', 400);
  }

  const campos = Object.fromEntries(
    Object.entries({ id_producto, tamano, precio_actual, activo })
      .filter(([, valor]) => valor !== undefined),
  );
  const data = await varianteService.actualizar(req.params.id, campos);
  res.json({ ok: true, data });
});

export const desactivar = asyncHandler(async (req, res) => {
  const data = await varianteService.desactivar(req.params.id);
  res.json({ ok: true, data });
});
