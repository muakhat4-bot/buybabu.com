const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://jyxhkjqtdscveqnknluv.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eGhranF0ZHNjdmVxbmtubHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk4NDEzMSwiZXhwIjoyMDk4NTYwMTMxfQ.HruMm924OEu5oxML2dKSZjpAZll7RvInX5W8CkhXIgA";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function main() {
  const { data: users } = await supabase.from('users').select('*');
  console.log("Users count:", users?.length);
  const { data: vendors } = await supabase.from('vendors').select('*, vendor_verifications(*)');
  console.log("Vendors in DB:", JSON.stringify(vendors, null, 2));
}

main().catch(console.error);
