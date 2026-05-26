import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxfqptzbrdkqcetxygzn.supabase.co';
const supabaseAnonKey = 'sb_publishable_UjwqFUa25-jZavn8Js6rcQ_LUIrNJtj';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPolicies() {
  try {
    console.log('--- Checking RLS Policies ---');
    const { data: policies, error: polErr } = await supabase
      .from('pg_policies')
      .select('*');
    
    if (polErr) {
      console.error('Error fetching pg_policies:', polErr.message);
    } else {
      console.log('Policies:', policies);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkPolicies();
