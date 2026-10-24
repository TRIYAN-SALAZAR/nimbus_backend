import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

const TABLE = 'producto';

export async function listar({ soloActivos = true } = {}) {
  let query = supabase.from(TABLE).select('*, variante(*)').order('nombre');
  if (soloActivos) query = query.eq('activo', true);

  const { data, error } = await query;
  if (error) throw fromSupabase(error);
  console.log(data)
  return data;
}

export async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, variante(*)')
    .eq('id_producto', id)
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function crear({ nombre, categoria }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ nombre, categoria })
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function actualizar(id, campos) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(campos)
    .eq('id_producto', id)
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

// Borrado lógico: conserva el historial de ventas
export async function desactivar(id) {
  return actualizar(id, { activo: false });
}
