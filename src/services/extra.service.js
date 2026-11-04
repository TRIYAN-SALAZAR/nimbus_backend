import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

const TABLE = 'extra';

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
    .eq('id_extra', id)
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function crear({ nombre, precio_actual }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ nombre, precio_actual })
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function actualizar(id, campos) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(campos)
    .eq('id_extra', id)
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function desactivar(id) {
  return actualizar(id, { activo: false });
}
