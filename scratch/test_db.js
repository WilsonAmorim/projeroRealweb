import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxfqptzbrdkqcetxygzn.supabase.co';
const supabaseAnonKey = 'sb_publishable_UjwqFUa25-jZavn8Js6rcQ_LUIrNJtj';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('--- Checking Users (usuarios) ---');
  const { data: users, error: userError } = await supabase
    .from('usuarios')
    .select('*')
    .limit(5);
  
  if (userError) {
    console.error('Error fetching users:', userError);
  } else {
    console.log('Users found:', users);
  }

  console.log('\n--- Checking Work Orders (ordens_servico) ---');
  const { data: os, error: osError } = await supabase
    .from('ordens_servico')
    .select('*')
    .limit(5);

  if (osError) {
    console.error('Error fetching OS:', osError);
  } else {
    console.log('OS found:', os);
  }

  if (os && os.length > 0) {
    const testOsId = os[0].id_os;
    const testUserId = users && users.length > 0 ? users[0].id_usuario : '987b663b-b1e5-44c5-a873-6ee4e52eec0f';
    
    console.log(`\n--- Trying to insert test laudo into os_laudo_mecanico ---`);
    console.log(`Using id_os: ${testOsId}, id_usuario: ${testUserId}`);
    
    const payload = {
      id_os: testOsId,
      tampa_la_especificado: 10.123,
      id_usuario: testUserId
    };

    const { data: insertData, error: insertError } = await supabase
      .from('os_laudo_mecanico')
      .insert([payload])
      .select();

    if (insertError) {
      console.error('INSERT ERROR:', insertError);
      console.log('Error Details:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('INSERT SUCCESS:', insertData);
      
      // Clean up test insert
      if (insertData && insertData.length > 0) {
        const { error: deleteError } = await supabase
          .from('os_laudo_mecanico')
          .delete()
          .eq('id_laudo_mecanico', insertData[0].id_laudo_mecanico);
        console.log('Cleanup delete:', deleteError ? deleteError : 'Success');
      }
    }
  } else {
    console.log('No OS found in the database to test with.');
  }
}

testDatabase();
