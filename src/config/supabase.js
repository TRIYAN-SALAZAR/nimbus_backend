import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Cliente único (singleton) reutilizado en todo el backend.
// Usa la service_role key, que ignora RLS: por eso solo vive aquí.
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
