import { NextResponse } from 'next/server';
import { supabaseAdmin, VendorStatus } from '@villex/supabase';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getDbJsonPath() {
  const possiblePaths = [
    path.resolve(process.cwd(), '../../db.json'),
    path.resolve(process.cwd(), '../db.json'),
    path.resolve(process.cwd(), 'db.json'),
    'd:\\Master Project\\Villex\\db.json'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.resolve(process.cwd(), '../../db.json');
}

function readLocalDbVendors() {
  try {
    const p = getDbJsonPath();
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      return data.vendors || [];
    }
  } catch (err) {
    console.error('Error reading local db.json:', err);
  }
  return [];
}

function saveLocalDbVendor(vendorData: any) {
  try {
    const p = getDbJsonPath();
    let data: any = { vendors: [] };
    if (fs.existsSync(p)) {
      data = JSON.parse(fs.readFileSync(p, 'utf8'));
    }
    if (!data.vendors) data.vendors = [];
    const idx = data.vendors.findIndex(
      (v: any) => (v.email && vendorData.email && v.email.toLowerCase() === vendorData.email.toLowerCase()) || (v.storeId && v.storeId === vendorData.storeId)
    );
    if (idx >= 0) {
      data.vendors[idx] = { ...data.vendors[idx], ...vendorData };
    } else {
      data.vendors.push({
        status: 'PENDING',
        verificationStatus: 'UNDER_REVIEW',
        joinedDate: new Date().toISOString().split('T')[0],
        revenue: 0,
        orders: 0,
        wallet: { availableBalance: 0, pendingBalance: 0, lifetimeSales: 0, lifetimeCommission: 0, transactions: [] },
        ...vendorData
      });
    }
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing vendor to db.json:', err);
  }
}

function updateLocalDbVendorStatus(emailOrId: string, status: string, verificationStatus?: string) {
  try {
    const p = getDbJsonPath();
    if (!fs.existsSync(p)) return;
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.vendors) return;
    const vendor = data.vendors.find(
      (v: any) => (v.email && v.email.toLowerCase() === emailOrId.toLowerCase()) || v.storeId === emailOrId || v.id === emailOrId
    );
    if (vendor) {
      vendor.status = status;
      if (verificationStatus) vendor.verificationStatus = verificationStatus;
      fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error updating vendor status in db.json:', err);
  }
}


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
        ntnNumber: latestVerification?.tax_id || null,
        wallet: v.wallet || { availableBalance: 0, pendingBalance: 0, lifetimeSales: 0, lifetimeCommission: 0, transactions: [] }
      };
    });

    const localVendors = readLocalDbVendors();
    const combined = [...mapped];
    for (const lv of localVendors) {
      const exists = combined.some(
        (v) => (v.email && lv.email && v.email.toLowerCase() === lv.email.toLowerCase()) || (v.storeId && lv.storeId && v.storeId === lv.storeId)
      );
      if (!exists) {
        combined.push(lv);
      }
    }

    return NextResponse.json(combined);
  } catch (err: any) {
    console.warn("Supabase error on vendor-portal GET /api/vendors, returning db.json fallback:", err?.message || err);
    return NextResponse.json(readLocalDbVendors());
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
          id: randomUUID(),
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
          support_phone: body.phone || '',
          wallet: body.wallet || null
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
          id: randomUUID(),
          owner_id: user.id,
          store_name: body.storeName,
          store_slug: storeSlug,
          support_email: emailLower,
          support_phone: body.phone || '',
          status: vStatus,
          commission_rate: 10.00,
          wallet: body.wallet || { availableBalance: 0, pendingBalance: 0, lifetimeSales: 0, lifetimeCommission: 0, transactions: [] }
        })
        .select()
        .single();

      if (vInsertError) throw vInsertError;
      vendor = newVendor;
    }

    if (body.ntnNumber) {
      await supabaseAdmin.from('vendor_verifications').insert({
        id: randomUUID(),
        vendor_id: vendor.id,
        legal_name: body.legalName || body.storeName,
        tax_id: body.ntnNumber,
        document_urls: {},
        verified_at: body.verificationStatus === 'APPROVED' ? new Date().toISOString() : null
      });

      // Trigger Super Admin notification for KYC / Verification Request
      try {
        const { data: superAdmin } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', 'almanar.edu.pk@gmail.com')
          .maybeSingle();

        if (superAdmin) {
          const isKycUpdate = existingVendor !== null;
          await supabaseAdmin.from('notifications').insert({
            id: randomUUID(),
            user_id: superAdmin.id,
            title: isKycUpdate ? 'Vendor KYC Updated' : 'Vendor Verification Requested',
            message: `Store "${body.storeName}" has ${isKycUpdate ? 'updated KYC details' : 'requested verification'}.`,
            type: 'SECURITY',
            link: '/vendors',
            is_read: false
          });
        }
      } catch (err) {
        console.error('Failed to notify super admin about vendor KYC/verification request:', err);
      }
    }

    return NextResponse.json({ success: true, vendor: { ...body, storeId: vendor.id } });
  } catch (err: any) {
    console.warn("Supabase error on vendor portal POST /api/vendors:", err?.message || err);
    saveLocalDbVendor(body);
    return NextResponse.json({ 
      success: true, 
      vendor: { 
        ...body, 
        storeId: body.storeId || `#VLX-MER-${Math.floor(100 + Math.random() * 900)}`,
        status: body.status || 'PENDING'
      } 
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'request_withdrawal') {
      const { email, amount } = body;
      if (!email || !amount) {
        return NextResponse.json({ success: false, error: 'Email and amount are required' }, { status: 400 });
      }

      const { data: vendor, error: findError } = await supabaseAdmin
        .from('vendors')
        .select('*')
        .eq('support_email', email.toLowerCase())
        .maybeSingle();

      if (findError) throw findError;
      if (!vendor) {
        return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
      }

      const wallet = (vendor.wallet as any) || { availableBalance: 0, pendingBalance: 0, lifetimeSales: 0, lifetimeCommission: 0, transactions: [] };
      if (wallet.availableBalance < amount) {
        return NextResponse.json({ success: false, error: 'Insufficient available balance' }, { status: 400 });
      }

      wallet.availableBalance -= amount;
      const today = new Date().toISOString().split('T')[0];
      const newTxId = `#VLX-PAY-${Math.floor(100000 + Math.random() * 900000)}`;

      const payoutMethod = body.payoutMethod || 'BANK';
      const detailsObj = body.payoutDetails || {};
      let detailsText = '';

      if (payoutMethod === 'BANK') {
        detailsText = `Withdrawal to Bank: ${detailsObj.bankName || 'Bank'} - Title: ${detailsObj.accountTitle || 'N/A'} - A/C: ${detailsObj.accountNumber || 'N/A'}`;
      } else if (payoutMethod === 'JAZZCASH') {
        detailsText = `Withdrawal to JazzCash - Title: ${detailsObj.accountTitle || 'N/A'} - No: ${detailsObj.mobileNumber || 'N/A'}`;
      } else if (payoutMethod === 'EASYPAISA') {
        detailsText = `Withdrawal to Easypaisa - Title: ${detailsObj.accountTitle || 'N/A'} - No: ${detailsObj.mobileNumber || 'N/A'}`;
      }

      wallet.transactions.push({
        id: newTxId,
        type: 'WITHDRAWAL',
        amount: amount,
        date: today,
        status: 'PENDING',
        details: detailsText,
        payoutMethod,
        payoutDetails: detailsObj
      });

      const { error: updateError } = await supabaseAdmin
        .from('vendors')
        .update({ wallet })
        .eq('id', vendor.id);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true });
    }

    if (body.action === 'approve_withdrawal') {
      const txId = body.transactionId;
      if (!txId) {
        return NextResponse.json({ success: false, error: 'transactionId is required' }, { status: 400 });
      }

      const { data: vendors, error: findError } = await supabaseAdmin
        .from('vendors')
        .select('*');

      if (findError) throw findError;

      const vendor = (vendors || []).find((v: any) => {
        const wallet = v.wallet as any;
        return wallet?.transactions?.some((tx: any) => tx.id === txId);
      });

      if (!vendor) {
        return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 400 });
      }

      const wallet = vendor.wallet as any;
      wallet.transactions = wallet.transactions.map((tx: any) => {
        if (tx.id === txId) {
          return { ...tx, status: 'APPROVED' };
        }
        return tx;
      });

      const { error: updateError } = await supabaseAdmin
        .from('vendors')
        .update({ wallet })
        .eq('id', vendor.id);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true });
    }

    if (body.action === 'pay_withdrawal') {
      const txId = body.transactionId;
      if (!txId) {
        return NextResponse.json({ success: false, error: 'transactionId is required' }, { status: 400 });
      }

      const { data: vendors, error: findError } = await supabaseAdmin
        .from('vendors')
        .select('*');

      if (findError) throw findError;

      const vendor = (vendors || []).find((v: any) => {
        const wallet = v.wallet as any;
        return wallet?.transactions?.some((tx: any) => tx.id === txId);
      });

      if (!vendor) {
        return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 400 });
      }

      const wallet = vendor.wallet as any;
      wallet.transactions = wallet.transactions.map((tx: any) => {
        if (tx.id === txId) {
          return { ...tx, status: 'PAID' };
        }
        return tx;
      });

      const { error: updateError } = await supabaseAdmin
        .from('vendors')
        .update({ wallet })
        .eq('id', vendor.id);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true });
    }

    if (body.action === 'reject_withdrawal') {
      const txId = body.transactionId;
      if (!txId) {
        return NextResponse.json({ success: false, error: 'transactionId is required' }, { status: 400 });
      }

      const { data: vendors, error: findError } = await supabaseAdmin
        .from('vendors')
        .select('*');

      if (findError) throw findError;

      const vendor = (vendors || []).find((v: any) => {
        const wallet = v.wallet as any;
        return wallet?.transactions?.some((tx: any) => tx.id === txId);
      });

      if (!vendor) {
        return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 400 });
      }

      const wallet = vendor.wallet as any;
      let refundAmount = 0;
      wallet.transactions = wallet.transactions.map((tx: any) => {
        if (tx.id === txId && tx.status !== 'REJECTED' && tx.status !== 'PAID') {
          refundAmount = tx.amount;
          return { ...tx, status: 'REJECTED' };
        }
        return tx;
      });

      wallet.availableBalance += refundAmount;

      const { error: updateError } = await supabaseAdmin
        .from('vendors')
        .update({ wallet })
        .eq('id', vendor.id);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true });
    }

    // Default update profile details
    const email = body.email;
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const { data: vendor, error: findVendorError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('support_email', email.toLowerCase())
      .maybeSingle();

    if (findVendorError) throw findVendorError;
    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    let vStatus = vendor.status;
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
