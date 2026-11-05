import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

const TABLE = 'proveedor';

export async function listar() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('nombre');
  if (error) throw fromSupabase(error);
  return data;
}

export async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id_proveedor', id)
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function crear({ nombre, contacto }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ nombre, contacto })
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function actualizar(id, campos) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(campos)
    .eq('id_proveedor', id)
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function eliminar(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id_proveedor', id)
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}
