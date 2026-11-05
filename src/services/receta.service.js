import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

export async function listarPorVariante(idVariante) {
  const { data, error } = await supabase
    .from('receta_variante')
    .select('*, insumo(*)')
    .eq('id_variante', idVariante)
    .order('id_insumo');
  if (error) throw fromSupabase(error);
  return data;
}

export async function agregarAVariante({
  id_variante,
  id_insumo,
  cantidad_consumida,
  solo_para_llevar = false,
}) {
  const { data, error } = await supabase
    .from('receta_variante')
    .insert({ id_variante, id_insumo, cantidad_consumida, solo_para_llevar })
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function quitarDeVariante(idVariante, idInsumo) {
  const { data, error } = await supabase
    .from('receta_variante')
    .delete()
    .eq('id_variante', idVariante)
    .eq('id_insumo', idInsumo)
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function listarPorExtra(idExtra) {
  const { data, error } = await supabase
    .from('receta_extra')
    .select('*, insumo(*)')
    .eq('id_extra', idExtra)
    .order('id_insumo');
  if (error) throw fromSupabase(error);
  return data;
}

export async function agregarAExtra({ id_extra, id_insumo, cantidad_consumida }) {
  const { data, error } = await supabase
    .from('receta_extra')
    .insert({ id_extra, id_insumo, cantidad_consumida })
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function quitarDeExtra(idExtra, idInsumo) {
  const { data, error } = await supabase
    .from('receta_extra')
    .delete()
    .eq('id_extra', idExtra)
    .eq('id_insumo', idInsumo)
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}
