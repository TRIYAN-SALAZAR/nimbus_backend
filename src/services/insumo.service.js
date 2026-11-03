import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

const TABLE = 'insumo';

export async function listar({ soloActivos = true } = {}) {
  let query = supabase.from(TABLE).select('*').order('nombre');
  if (soloActivos) query = query.eq('activo', true);
  const { data, error } = await query;
  if (error) throw fromSupabase(error);
  return data;
}

export async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id_insumo', id)
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function crear({ nombre, unidad_medida, stock_minimo }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ nombre, unidad_medida, stock_minimo })
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function actualizar(id, campos) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(campos)
    .eq('id_insumo', id)
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function desactivar(id) {
  return actualizar(id, { activo: false });
}
