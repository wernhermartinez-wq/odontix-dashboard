import { createClient } from '@supabase/supabase-js';

// Credenciales desde variables de entorno — nunca hardcoded
// En Vercel: Settings → Environment Variables → agregar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
// En desarrollo local: crear archivo odontix-src/.env.local con esas variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
    'Crea un archivo .env.local en odontix-src/ o configúralas en Vercel.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
