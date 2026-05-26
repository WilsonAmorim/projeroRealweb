import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxfqptzbrdkqcetxygzn.supabase.co';
const supabaseAnonKey = 'sb_publishable_UjwqFUa25-jZavn8Js6rcQ_LUIrNJtj';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTables() {
  console.log('--- Checking os_laudo_eletrico ---');
  const { data, error } = await supabase
    .from('os_laudo_eletrico')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error on os_laudo_eletrico select:', error);
  } else {
    console.log('os_laudo_eletrico exists and select succeeded! Count:', data.length);
  }
}

testTables();
