import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxfqptzbrdkqcetxygzn.supabase.co';
const supabaseAnonKey = 'sb_publishable_UjwqFUa25-jZavn8Js6rcQ_LUIrNJtj';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedData() {
  console.log('Seeding data...');

  // 1. Check if 'Administrador' profile exists
  let { data: perfil } = await supabase
    .from('perfis_acesso')
    .select('*')
    .eq('nome_perfil', 'Administrador')
    .single();

  if (!perfil) {
    console.log('Creating Administrador profile...');
    const { data, error } = await supabase
      .from('perfis_acesso')
      .insert([{ nome_perfil: 'Administrador' }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating profile:', error.message);
      return;
    }
    perfil = data;
  }
  console.log('Profile Administrador ID:', perfil.id_perfil);

  // 2. We need the UUID from auth.users for wilson.amorim@saeb.ba.gov.br
  // Since we can't easily get it via anon key without login, 
  // the user needs to login first, then we can insert the profile.
  // OR the user can provide the UUID.
  
  // Actually, I can try to find the user in auth.users if I had the service key, but I don't.
  // However, the user said they are trying to login and it's not working.
  
  console.log('Please note: You must have a record in the "usuarios" table with your Supabase Auth ID.');
}

seedData();
