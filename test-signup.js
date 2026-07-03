const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = "https://jyxhkjqtdscveqnknluv.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eGhranF0ZHNjdmVxbmtubHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk4NDEzMSwiZXhwIjoyMDk4NTYwMTMxfQ.HruMm924OEu5oxML2dKSZjpAZll7RvInX5W8CkhXIgA";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function main() {
  const body = {
    firstName: "TestNew",
    lastName: "User",
    email: "testnewuser" + Date.now() + "@gmail.com",
    phone: "0300-1234567",
    storeName: "TestNew Store " + Date.now(),
    ntnNumber: "NTN-123456-9",
    legalName: "TestNew Store Legal",
    bankName: "Meezan Bank",
    bankAccountTitle: "TestNew Account Title",
    bankAccountNumber: "01020304050607"
  };

  try {
    const emailLower = body.email.toLowerCase();
    
    // 1. Find or create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: randomUUID(),
        email: emailLower,
        password_hash: '$2b$10$devSaltPlaceholderForHashedPasswords1234567890',
        first_name: body.firstName,
        last_name: body.lastName,
        phone: body.phone || ''
      })
      .select()
      .single();

    if (userError) {
      console.error("User insert failed:", userError);
      return;
    }
    console.log("User created:", user.id);

    // 2. Link role
    const { data: role } = await supabaseAdmin
      .from('roles')
      .select('*')
      .eq('name', 'VENDOR_ADMIN')
      .maybeSingle();

    if (role) {
      const { error: linkError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: user.id,
          role_id: role.id
        });
      if (linkError) console.error("Role link failed:", linkError);
      else console.log("Role linked.");
    }

    // 3. Create vendor
    const storeSlug = body.storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .insert({
        id: randomUUID(),
        owner_id: user.id,
        store_name: body.storeName,
        store_slug: storeSlug,
        support_email: emailLower,
        support_phone: body.phone || '',
        status: 'PENDING',
        commission_rate: 10.00
      })
      .select()
      .single();

    if (vendorError) {
      console.error("Vendor insert failed:", vendorError);
      return;
    }
    console.log("Vendor created:", vendor.id);

    // 4. Verification
    if (body.ntnNumber) {
      const { error: verError } = await supabaseAdmin.from('vendor_verifications').insert({
        id: randomUUID(),
        vendor_id: vendor.id,
        legal_name: body.legalName,
        tax_id: body.ntnNumber,
        document_urls: {},
        verified_at: null
      });
      if (verError) {
        console.error("Verification insert failed:", verError);
      } else {
        console.log("Verification record created.");
      }
    }
    
    console.log("All steps completed successfully!");
  } catch (err) {
    console.error("Exception occurred:", err);
  }
}

main().catch(console.error);
