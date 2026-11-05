import * as proveedorService from '../services/proveedor.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await proveedorService.listar();
  res.json({ ok: true, data });
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await proveedorService.obtenerPorId(req.params.id);
  res.json({ ok: true, data });
});

export const crear = asyncHandler(async (req, res) => {
  const { nombre, contacto } = req.body ?? {};
  if (!nombre) throw new AppError('El campo "nombre" es obligatorio', 400);

  const data = await proveedorService.crear({ nombre, contacto });
  res.status(201).json({ ok: true, data });
});

export const actualizar = asyncHandler(async (req, res) => {
  const { nombre, contacto } = req.body ?? {};
  if (nombre === undefined && contacto === undefined) {
    throw new AppError('Debe enviar al menos un campo para actualizar', 400);
  }

  const campos = Object.fromEntries(
    Object.entries({ nombre, contacto })
      .filter(([, valor]) => valor !== undefined),
  );
  const data = await proveedorService.actualizar(req.params.id, campos);
  res.json({ ok: true, data });
});

export const eliminar = asyncHandler(async (req, res) => {
  const data = await proveedorService.eliminar(req.params.id);
  res.json({ ok: true, data });
});
