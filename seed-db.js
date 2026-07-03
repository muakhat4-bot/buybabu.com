const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = "https://jyxhkjqtdscveqnknluv.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eGhranF0ZHNjdmVxbmtubHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk4NDEzMSwiZXhwIjoyMDk4NTYwMTMxfQ.HruMm924OEu5oxML2dKSZjpAZll7RvInX5W8CkhXIgA";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function main() {
  console.log("Seeding Database...");

  // 1. Seed Roles
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Platform Administrator' },
    { name: 'VENDOR_ADMIN', description: 'Store Vendor Owner' },
    { name: 'CUSTOMER', description: 'Marketplace Buyer' }
  ];

  for (const role of roles) {
    const { data: existingRole } = await supabase
      .from('roles')
      .select('*')
      .eq('name', role.name)
      .maybeSingle();

    if (!existingRole) {
      const { error } = await supabase.from('roles').insert(role);
      if (error) {
        console.error(`Failed to insert role ${role.name}:`, error);
      } else {
        console.log(`Role ${role.name} created.`);
      }
    } else {
      console.log(`Role ${role.name} already exists.`);
    }
  }

  // Get Role IDs
  const { data: dbRoles } = await supabase.from('roles').select('*');
  const superAdminRole = dbRoles.find(r => r.name === 'SUPER_ADMIN');

  // 2. Seed Super Admin User
  const adminEmail = 'almanar.edu.pk@gmail.com'; // lowercase
  const { data: existingAdmin } = await supabase
    .from('users')
    .select('*')
    .eq('email', adminEmail)
    .maybeSingle();

  let adminUser;
  if (!existingAdmin) {
    const { data: newAdmin, error } = await supabase
      .from('users')
      .insert({
        id: randomUUID(),
        email: adminEmail,
        password_hash: '$2b$10$devSaltPlaceholderForHashedPasswords1234567890',
        first_name: 'Abu',
        last_name: 'Saad',
        phone: '051-5551234'
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create Super Admin user:", error);
    } else {
      console.log("Super Admin user created.");
      adminUser = newAdmin;
    }
  } else {
    console.log("Super Admin user already exists.");
    adminUser = existingAdmin;
  }

  // 3. Link Super Admin role
  if (adminUser && superAdminRole) {
    const { data: existingLink } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', adminUser.id)
      .eq('role_id', superAdminRole.id)
      .maybeSingle();

    if (!existingLink) {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: adminUser.id,
          role_id: superAdminRole.id
        });

      if (error) {
        console.error("Failed to link Super Admin role to user:", error);
      } else {
        console.log("Super Admin role linked to user successfully.");
      }
    } else {
      console.log("Super Admin role already linked to user.");
    }
  }
}

main().catch(console.error);
