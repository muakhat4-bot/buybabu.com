import { NextResponse } from 'next/server';
import { supabaseAdmin, VendorStatus } from '@villex/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: vendors, error } = await supabaseAdmin
      .from('vendors')
      .select('*, users(*), vendor_verifications(*)');

    if (error) throw error;

    const mapped = (vendors || []).map(v => {
      const verifications = v.vendor_verifications || [];
      const latestVerification = verifications[0];
      const user = v.users;

      return {
        email: v.support_email,
        storeName: v.store_name,
        storeId: v.id,
        firstName: user ? user.first_name : '',
        lastName: user ? user.last_name : '',
        phone: v.support_phone,
        status: v.status,
        joinedDate: new Date(v.created_at).toISOString().split('T')[0],
        verificationStatus: latestVerification?.verified_at ? 'APPROVED' : (v.status === 'REJECTED' ? 'REJECTED' : 'PENDING'),
        legalName: latestVerification?.legal_name || null,
        ntnNumber: latestVerification?.tax_id || null
      };
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailLower = body.email.toLowerCase();
    
    // Find or create user
    const { data: existingUser, error: findUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    if (findUserError) throw findUserError;

    let user;
    if (existingUser) {
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          first_name: body.firstName || body.storeName.split(' ')[0] || 'Owner',
          last_name: body.lastName || 'Owner',
          phone: body.phone || ''
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      user = updatedUser;
    } else {
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          email: emailLower,
          password_hash: '$2b$10$devSaltPlaceholderForHashedPasswords1234567890',
          first_name: body.firstName || body.storeName.split(' ')[0] || 'Owner',
          last_name: body.lastName || 'Owner',
          phone: body.phone || ''
        })
        .select()
        .single();

      if (insertError) throw insertError;
      user = newUser;
    }

    const { data: role, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('*')
      .eq('name', 'VENDOR_ADMIN')
      .maybeSingle();

    if (!roleError && role) {
      const { data: link } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role_id', role.id)
        .maybeSingle();

      if (!link) {
        await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: user.id,
            role_id: role.id
          });
      }
    }

    const storeSlug = body.storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    let vStatus = VendorStatus.PENDING;
    if (body.status === 'ACTIVE') vStatus = VendorStatus.ACTIVE;
    if (body.status === 'SUSPENDED') vStatus = VendorStatus.SUSPENDED;
    if (body.status === 'REJECTED') vStatus = VendorStatus.REJECTED;

    const { data: existingVendor, error: findVendorError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('store_name', body.storeName)
      .maybeSingle();

    if (findVendorError) throw findVendorError;

    let vendor;
    if (existingVendor) {
      const { data: updatedVendor, error: vUpdateError } = await supabaseAdmin
        .from('vendors')
        .update({
          status: vStatus,
          support_email: emailLower,
          support_phone: body.phone || ''
        })
        .eq('id', existingVendor.id)
        .select()
        .single();

      if (vUpdateError) throw vUpdateError;
      vendor = updatedVendor;
    } else {
      const { data: newVendor, error: vInsertError } = await supabaseAdmin
        .from('vendors')
        .insert({
          owner_id: user.id,
          store_name: body.storeName,
          store_slug: storeSlug,
          support_email: emailLower,
          support_phone: body.phone || '',
          status: vStatus,
          commission_rate: 10.00
        })
        .select()
        .single();

      if (vInsertError) throw vInsertError;
      vendor = newVendor;
    }

    if (body.ntnNumber) {
      await supabaseAdmin.from('vendor_verifications').insert({
        vendor_id: vendor.id,
        legal_name: body.legalName || body.storeName,
        tax_id: body.ntnNumber,
        document_urls: {},
        verified_at: body.verificationStatus === 'APPROVED' ? new Date().toISOString() : null
      });
    }

    return NextResponse.json({ success: true, vendor: { ...body, storeId: vendor.id } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const { data: vendor, error: findVendorError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('support_email', body.email.toLowerCase())
      .maybeSingle();

    if (findVendorError) throw findVendorError;
    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    let vStatus = VendorStatus.PENDING;
    if (body.status === 'ACTIVE') vStatus = VendorStatus.ACTIVE;
    if (body.status === 'SUSPENDED') vStatus = VendorStatus.SUSPENDED;
    if (body.status === 'REJECTED') vStatus = VendorStatus.REJECTED;

    const { error: updateVendorError } = await supabaseAdmin
      .from('vendors')
      .update({ status: vStatus })
      .eq('id', vendor.id);

    if (updateVendorError) throw updateVendorError;

    const { data: verification } = await supabaseAdmin
      .from('vendor_verifications')
      .select('*')
      .eq('vendor_id', vendor.id)
      .maybeSingle();

    if (verification) {
      await supabaseAdmin
        .from('vendor_verifications')
        .update({
          verified_at: body.verificationStatus === 'APPROVED' ? new Date().toISOString() : null
        })
        .eq('id', verification.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
