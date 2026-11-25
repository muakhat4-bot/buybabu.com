import { NextResponse } from 'next/server';
import { supabaseAdmin, VendorStatus } from '@villex/supabase';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUuid = (id: string) => UUID_REGEX.test(id);

interface AuthSuccess {
  vendor: any;
  user: any;
}

interface AuthError {
  errorResponse: NextResponse;
}

type AuthResult = AuthSuccess | AuthError;

/**
 * Strict authentication helper for Vendor API:
 * - Requires a valid Supabase JWT in the Authorization header.
 * - Verifies the token using supabaseAdmin.auth.getUser(token).
 * - Rejects missing, invalid, or expired tokens with HTTP 401.
 * - Resolves the vendor record EXCLUSIVELY via vendors.owner_id = user.id.
 * - Never trusts client-supplied email, storeId, or id query parameters.
 * - Rejects authenticated users without a vendor store record with HTTP 403.
 */
async function authenticateVendor(request: Request): Promise<AuthResult> {
  const authHeader =
    request.headers.get('authorization') ||
    request.headers.get('x-forwarded-authorization') ||
    request.headers.get('x-vendor-token') ||
    request.headers.get('x-supabase-auth');

  if (!authHeader || !authHeader.trim()) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Missing or malformed Authorization header' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Bearer token is empty' },
        { status: 401 }
      ),
    };
  }

  try {
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData?.user) {
      return {
        errorResponse: NextResponse.json(
          { success: false, error: `Unauthorized: Invalid or expired token (${authError?.message || 'Authentication failed'})` },
          { status: 401 }
        ),
      };
    }

    const user = userData.user;
    if (!user.id || !isValidUuid(user.id)) {
      return {
        errorResponse: NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid user identifier' },
          { status: 401 }
        ),
      };
    }

    // Resolve vendor strictly through verified user id -> vendors.owner_id
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (vendorError) {
      console.error('Database error resolving vendor by owner_id:', vendorError);
      return {
        errorResponse: NextResponse.json(
          { success: false, error: 'Internal server error resolving vendor account' },
          { status: 500 }
        ),
      };
    }

    if (!vendor) {
      return {
        errorResponse: NextResponse.json(
          { success: false, error: 'Forbidden: No registered vendor profile associated with this account' },
          { status: 403 }
        ),
      };
    }

    return { vendor, user };
  } catch (err: any) {
    console.error('Unexpected auth verification exception:', err);
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication service error' },
        { status: 401 }
      ),
    };
  }
}

export async function GET(request: Request) {
  const auth = await authenticateVendor(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }
  const vendor = auth.vendor;

  try {
    // Fetch verification status if present, without exposing tax/NTN or legal registration documents
    const { data: verifications } = await supabaseAdmin
      .from('vendor_verifications')
      .select('verified_at')
      .eq('vendor_id', vendor.id)
      .limit(1);

    const latestVerification = verifications && verifications[0];

    // Return only the fields needed by the vendor portal.
    // Do NOT expose unnecessary tax, legal, or unneeded private information (e.g. tax_id/ntnNumber).
    const safeVendor = {
      storeId: vendor.id,
      storeName: vendor.store_name,
      email: vendor.support_email,
      phone: vendor.support_phone,
      status: vendor.status,
      joinedDate: vendor.created_at ? new Date(vendor.created_at).toISOString().split('T')[0] : '',
      verificationStatus: latestVerification?.verified_at
        ? 'APPROVED'
        : vendor.status === 'REJECTED'
        ? 'REJECTED'
        : 'PENDING',
      wallet: vendor.wallet || {
        availableBalance: 0,
        pendingBalance: 0,
        lifetimeSales: 0,
        lifetimeCommission: 0,
        transactions: [],
      },
      bankName: vendor.bank_details?.bankName || null,
      bankAccountTitle: vendor.bank_details?.accountTitle || null,
      bankAccountNumber: vendor.bank_details?.accountNumber || null,
    };

    return NextResponse.json([safeVendor]);
  } catch (err: any) {
    console.warn('Supabase error on vendor-portal GET /api/vendors:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve vendor profile' }, { status: 500 });
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
    console.error("Supabase error on vendor portal POST /api/vendors:", err?.message || err);
    return NextResponse.json({ 
      success: false, 
      error: err?.message || 'Failed to update vendor'
    }, { status: 500 });
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
