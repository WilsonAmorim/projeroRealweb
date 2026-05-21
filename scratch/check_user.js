import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxfqptzbrdkqcetxygzn.supabase.co';
const supabaseAnonKey = 'sb_publishable_UjwqFUa25-jZavn8Js6rcQ_LUIrNJtj';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkById() {
  const id = 'e1c9977d-0a71-4f69-886c-a67d155e1ad4';
  console.log(`Checking user ID: ${id}`);
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id_usuario', id);

  if (error) {
    console.error('Error fetching user:', error.message);
  } else {
    console.log('Results count:', data.length);
    console.log('User data:', JSON.stringify(data, null, 2));
  }
}

checkById();
