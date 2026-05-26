import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(envFile.split('\n').filter(Boolean).map(line => line.split('=')));

const supabase = createClient(env.VITE_SUPABASE_URL.trim(), env.VITE_SUPABASE_ANON_KEY.trim());

async function check() {
  const { data, error } = await supabase.from('os_laudo_eletrico').update({ tensao_nominal: 380 }).eq('id_os', -1);
  console.log('Error:', error);
}

check();
