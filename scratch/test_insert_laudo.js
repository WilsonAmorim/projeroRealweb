import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxfqptzbrdkqcetxygzn.supabase.co';
const supabaseAnonKey = 'sb_publishable_UjwqFUa25-jZavn8Js6rcQ_LUIrNJtj';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullFlow() {
  try {
    console.log('--- Fetching Clientes ---');
    const { data: clientes, error: cliError } = await supabase.from('cliente').select('*').limit(5);
    console.log('Clientes:', cliError ? cliError.message : clientes);

    console.log('\n--- Fetching Motores ---');
    const { data: motores, error: motError } = await supabase.from('motores').select('*').limit(5);
    console.log('Motores:', motError ? motError.message : motores);

    console.log('\n--- Fetching Ordens de Servico ---');
    const { data: os, error: osError } = await supabase.from('ordens_servico').select('*').limit(5);
    console.log('Ordens Servico:', osError ? osError.message : os);

    // If there is no OS, let's try to create a dummy OS to test os_laudo_mecanico
    let testOsId = null;
    let createdOs = false;
    let createdMotor = false;
    let createdCliente = false;
    let testMotorId = null;
    let testClienteId = null;

    if (os && os.length > 0) {
      testOsId = os[0].id_os;
    } else {
      console.log('\nCreating dummy entities for test...');
      
      // Get or create client
      if (clientes && clientes.length > 0) {
        testClienteId = clientes[0].id_cliente;
      } else {
        const { data: newCli, error: newCliErr } = await supabase
          .from('cliente')
          .insert([{ nome_razao_social: 'Cliente Teste Ltda', cpf_cnpj: '12345678901', telefone: '71999999999' }])
          .select();
        
        if (newCliErr) {
          console.error('Failed to create dummy client:', newCliErr);
          return;
        }
        testClienteId = newCli[0].id_cliente;
        createdCliente = true;
        console.log('Created dummy client:', testClienteId);
      }

      // Get or create motor
      if (motores && motores.length > 0) {
        testMotorId = motores[0].id_motor;
      } else {
        const { data: newMot, error: newMotErr } = await supabase
          .from('motores')
          .insert([{ id_cliente: testClienteId, num_serie: 'TEST123456', fabricante: 'WEG' }])
          .select();

        if (newMotErr) {
          console.error('Failed to create dummy motor:', newMotErr);
          if (createdCliente) {
            await supabase.from('cliente').delete().eq('id_cliente', testClienteId);
          }
          return;
        }
        testMotorId = newMot[0].id_motor;
        createdMotor = true;
        console.log('Created dummy motor:', testMotorId);
      }

      // Create OS
      const { data: newOs, error: newOsErr } = await supabase
        .from('ordens_servico')
        .insert([{
          id_motor: testMotorId,
          data_entrada: new Date().toISOString(),
          id_andamento: 9
        }])
        .select();

      if (newOsErr) {
        console.error('Failed to create dummy OS:', newOsErr);
        if (createdMotor) await supabase.from('motores').delete().eq('id_motor', testMotorId);
        if (createdCliente) await supabase.from('cliente').delete().eq('id_cliente', testClienteId);
        return;
      }
      testOsId = newOs[0].id_os;
      createdOs = true;
      console.log('Created dummy OS:', testOsId);
    }

    console.log(`\nTesting os_laudo_mecanico insert with id_os: ${testOsId}`);
    
    // Attempting insert
    const payload = {
      id_os: testOsId,
      tampa_la_especificado: 12.345,
      tampa_la_encontrado: 12.340,
      tampa_la_deixado: 12.345,
      id_usuario: '987b663b-b1e5-44c5-a873-6ee4e52eec0f'
    };

    const { data: insertRes, error: insertErr } = await supabase
      .from('os_laudo_mecanico')
      .insert([payload])
      .select();

    if (insertErr) {
      console.error('INSERT FAILED!', insertErr);
    } else {
      console.log('INSERT SUCCEEDED!', insertRes);
      
      // Clean up the laudo
      const { error: delLaudoErr } = await supabase
        .from('os_laudo_mecanico')
        .delete()
        .eq('id_laudo_mecanico', insertRes[0].id_laudo_mecanico);
      console.log('Laudo cleanup:', delLaudoErr ? delLaudoErr.message : 'Success');
    }

    // Clean up dummy OS, motor, client
    if (createdOs) {
      const { error: delOsErr } = await supabase.from('ordens_servico').delete().eq('id_os', testOsId);
      console.log('OS cleanup:', delOsErr ? delOsErr.message : 'Success');
    }
    if (createdMotor) {
      const { error: delMotErr } = await supabase.from('motores').delete().eq('id_motor', testMotorId);
      console.log('Motor cleanup:', delMotErr ? delMotErr.message : 'Success');
    }
    if (createdCliente) {
      const { error: delCliErr } = await supabase.from('cliente').delete().eq('id_cliente', testClienteId);
      console.log('Cliente cleanup:', delCliErr ? delCliErr.message : 'Success');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testFullFlow();
