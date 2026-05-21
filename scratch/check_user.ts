import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function checkUser() {
  const email = 'wilson.amorim@saeb.ba.gov.br';
  console.log(`Checking user: ${email}`);
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user:', error.message);
  } else {
    console.log('User found:', data);
  }
}

checkUser();
