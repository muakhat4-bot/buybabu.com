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
    firstName: "Zahid",
    lastName: "Mushtaq",
    email: "zarkhkhan@gmail.com",
    phone: "03029808684",
    storeName: "Nova Goods",
    ntnNumber: "NTN-123456-9",
    legalName: "Nova Goods Legal",
    bankName: "Meezan Bank",
    bankAccountTitle: "Zahid Mushtaq",
    bankAccountNumber: "01020304050607"
  };

  try {
    const emailLower = body.email.toLowerCase();
    
    // Find user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', emailLower)
      .single();

    if (userError) {
      console.error("User find failed:", userError);
      return;
    }
    console.log("User found:", user.id);

    // Create vendor
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

    // Verification
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
  } catch (err) {
    console.error("Exception occurred:", err);
  }
}

main().catch(console.error);
