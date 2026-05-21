import { createClient } from '@supabase/supabase-js';

// No Frontend (Vite), a leitura das variáveis do .env é feita assim:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Atenção: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não foram encontradas no arquivo .env');
}

// Exporta o cliente do Supabase pronto para o Frontend usar
export const supabase = createClient(supabaseUrl, supabaseAnonKey);