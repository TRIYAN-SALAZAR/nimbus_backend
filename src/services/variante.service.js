import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

const TABLE = 'variante';

export async function listar({ soloActivos = true, idProducto } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*, producto(*)')
    .order('id_producto')
    .order('tamano');
  if (soloActivos) query = query.eq('activo', true);
  if (idProducto !== undefined) query = query.eq('id_producto', idProducto);
  const { data, error } = await query;
  if (error) throw fromSupabase(error);
  return data;
}

export async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, producto(*)')
    .eq('id_variante', id)
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function crear({ id_producto, tamano, precio_actual }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ id_producto, tamano, precio_actual })
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function actualizar(id, campos) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(campos)
    .eq('id_variante', id)
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function desactivar(id) {
  return actualizar(id, { activo: false });
}
