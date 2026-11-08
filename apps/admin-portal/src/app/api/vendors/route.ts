import { NextResponse } from 'next/server';
import { supabaseAdmin, VendorStatus } from '@villex/supabase';
import { randomUUID } from 'crypto';
import { isAuthorizedAdmin, unauthorizedResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

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

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.warn('Supabase error on admin-portal GET /api/vendors:', err?.message || err);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

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
    }

    return NextResponse.json({ success: true, vendor: { ...body, storeId: vendor.id } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

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

    let finalOwnerId = vendor.owner_id;

    // Supabase Auth Integration on Vendor Approval
    if (vStatus === VendorStatus.ACTIVE) {
      if (!vendor.owner_id) {
        throw new Error('Vendor does not have an owner profile linked.');
      }

      // 1. Fetch current owner user details
      const { data: owner, error: ownerError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', vendor.owner_id)
        .maybeSingle();

      if (ownerError) {
        console.error('[Supabase Auth Integration] Error fetching user profile from database:', ownerError);
        throw ownerError;
      }
      if (!owner) throw new Error('Vendor owner user profile not found.');

      // 2. Retrieve password from prefix plain: or fallback
      let plaintextPassword = 'SecurePassword123!';
      if (owner.password_hash && owner.password_hash.startsWith('plain:')) {
        plaintextPassword = owner.password_hash.replace('plain:', '');
      }

      // 3. Create or update user in Supabase Authentication
      let authUser = null;
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: owner.email,
        password: plaintextPassword,
        email_confirm: true,
        user_metadata: {
          storeId: vendor.id,
          storeName: vendor.store_name,
          firstName: owner.first_name,
          lastName: owner.last_name,
          role: 'VENDOR_ADMIN'
        }
      });

      if (authError) {
        console.warn('[Supabase Auth Integration] createUser failed, attempting safe duplicate resolution. Error details:', authError);
        if (authError.message.toLowerCase().includes('already exists') || authError.message.toLowerCase().includes('already registered')) {
          const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          if (listError) {
            console.error('[Supabase Auth Integration] Error listing auth users:', listError);
            throw listError;
          }
          const existingAuthUser = userList?.users?.find(u => u.email?.toLowerCase() === owner.email.toLowerCase());
          
          if (existingAuthUser) {
            const { data: updatedAuthUser, error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
              existingAuthUser.id,
              {
                password: plaintextPassword,
                user_metadata: {
                  storeId: vendor.id,
                  storeName: vendor.store_name,
                  firstName: owner.first_name,
                  lastName: owner.last_name,
                  role: 'VENDOR_ADMIN'
                }
              }
            );
            if (updateAuthError) {
              console.error('[Supabase Auth Integration] Error updating existing auth user details:', updateAuthError);
              throw updateAuthError;
            }
            authUser = updatedAuthUser.user;
          } else {
            console.error('[Supabase Auth Integration] Auth user duplicate conflict exists but could not be located in directory list:', authError.message);
            throw new Error(`Auth user already exists but could not be located: ${authError.message}`);
          }
        } else {
          console.error('[Supabase Auth Integration] Auth user creation failed with fatal exception:', authError);
          throw authError;
        }
      } else {
        authUser = authData.user;
      }

      if (!authUser) {
        throw new Error('Supabase Auth user creation returned null.');
      }

      // 4. Synchronize database UUID to match Supabase Auth user ID
      const oldUserId = owner.id;
      const newUserId = authUser.id;
      finalOwnerId = newUserId;

      if (oldUserId !== newUserId) {
        // Temporarily change email of the old user to satisfy the users_email_key unique constraint
        const tempEmail = `old-${Date.now()}-${owner.email}`;
        await supabaseAdmin
          .from('users')
          .update({ email: tempEmail })
          .eq('id', oldUserId);

        // Insert new user record
        const { error: insertUserError } = await supabaseAdmin
          .from('users')
          .insert({
            id: newUserId,
            email: owner.email,
            password_hash: '$2b$10$devSaltPlaceholderForHashedPasswords1234567890',
            first_name: owner.first_name,
            last_name: owner.last_name,
            phone: owner.phone,
            is_active: owner.is_active,
            email_verified_at: new Date().toISOString()
          });

        if (insertUserError) {
          console.error('[Supabase Auth Integration] Error syncing new user profile UUID to database:', insertUserError);
          throw insertUserError;
        }

        // Link role
        const { data: roleObj } = await supabaseAdmin
          .from('roles')
          .select('*')
          .eq('name', 'VENDOR_ADMIN')
          .maybeSingle();

        if (roleObj) {
          await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', newUserId);

          const { error: linkError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: newUserId,
              role_id: roleObj.id
            });
          if (linkError) {
            console.error('[Supabase Auth Integration] Error linking user role VENDOR_ADMIN to synced user UUID:', linkError);
            throw linkError;
          }
        }

        // Update tables referencing user_id
        await supabaseAdmin
          .from('notifications')
          .update({ user_id: newUserId })
          .eq('user_id', oldUserId);

        await supabaseAdmin
          .from('orders')
          .update({ user_id: newUserId })
          .eq('user_id', oldUserId);

        // Update vendors table owner_id
        const { error: updateVendorOwnerError } = await supabaseAdmin
          .from('vendors')
          .update({ owner_id: newUserId })
          .eq('id', vendor.id);

        if (updateVendorOwnerError) {
          console.error('[Supabase Auth Integration] Error updating owner_id on vendors table:', updateVendorOwnerError);
          throw updateVendorOwnerError;
        }

        // Delete old role links
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', oldUserId);

        // Delete old user
        const { error: deleteUserError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', oldUserId);

        if (deleteUserError) {
          console.warn(`[Supabase Auth Integration] Non-blocking warning: Old user delete failed:`, deleteUserError.message);
        }
      } else {
        // Clear plain password prefix
        await supabaseAdmin
          .from('users')
          .update({ password_hash: '$2b$10$devSaltPlaceholderForHashedPasswords1234567890' })
          .eq('id', newUserId);
      }
    }

    // 5. Commit vendor status and owner_id update in database
    const { error: updateVendorError } = await supabaseAdmin
      .from('vendors')
      .update({ 
        status: vStatus,
        owner_id: finalOwnerId
      })
      .eq('id', vendor.id);

    if (updateVendorError) {
      console.error('[Supabase Auth Integration] Error committing vendor status/owner changes:', updateVendorError);
      throw updateVendorError;
    }

    const { data: verification } = await supabaseAdmin
      .from('vendor_verifications')
      .select('*')
      .eq('vendor_id', vendor.id)
      .maybeSingle();

    if (verification) {
      const { error: updateVerificationError } = await supabaseAdmin
        .from('vendor_verifications')
        .update({
          verified_at: body.verificationStatus === 'APPROVED' ? new Date().toISOString() : null,
          rejection_reason: body.status === 'REJECTED' ? (body.rejectionReason || 'Compliance verification audit failed.') : null
        })
        .eq('id', verification.id);
      
      if (updateVerificationError) {
        console.error('[Supabase Auth Integration] Error updating vendor verification record:', updateVerificationError);
      }
    }

    // Trigger notification to the Vendor owner
    if (vStatus !== vendor.status && finalOwnerId) {
      try {
        let notifTitle = '';
        let notifMsg = '';

        if (vStatus === VendorStatus.ACTIVE) {
          notifTitle = 'Store Account Approved';
          notifMsg = `Congratulations! Your store "${vendor.store_name}" has been approved. Your dashboard is now fully active.`;
        } else if (vStatus === VendorStatus.REJECTED) {
          notifTitle = 'Store Account Declined';
          notifMsg = `Your store onboarding request was declined. Reason: "${body.rejectionReason || 'Compliance verification failed.'}"`;
        } else if (vStatus === VendorStatus.SUSPENDED) {
          notifTitle = 'Store Account Suspended';
          notifMsg = `Your store "${vendor.store_name}" has been suspended by the platform administrator.`;
        }

        if (notifTitle) {
          await supabaseAdmin.from('notifications').insert({
            id: randomUUID(),
            user_id: finalOwnerId,
            title: notifTitle,
            message: notifMsg,
            type: 'SECURITY',
            is_read: false
          });
        }
      } catch (notificationError) {
        console.error('Failed to create status change notification for vendor:', notificationError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Vendor approval PUT handler fatal exception caught:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('id');

    if (!storeId) {
      return NextResponse.json({ success: false, error: 'Vendor ID (id) is required' }, { status: 400 });
    }

    // 1. Fetch vendor to get owner_id
    const { data: vendor, error: findVendorError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('id', storeId)
      .maybeSingle();

    if (findVendorError) {
      console.error('[Vendor Delete] Error finding vendor:', findVendorError);
      throw findVendorError;
    }

    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    const ownerId = vendor.owner_id;

    // 2. Fetch vendor products to trace variants and dependencies
    const { data: products, error: productsFetchError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('vendor_id', storeId);

    if (productsFetchError) {
      console.error('[Vendor Delete] Error fetching products:', productsFetchError);
      throw productsFetchError;
    }

    const productIds = products ? products.map(p => p.id) : [];

    // 3. Find product variants to clean up inventory, cart items, and wishlist items
    let variantIds: string[] = [];
    if (productIds.length > 0) {
      const { data: variants, error: variantsFetchError } = await supabaseAdmin
        .from('product_variants')
        .select('id')
        .in('product_id', productIds);
      
      if (variantsFetchError) {
        console.error('[Vendor Delete] Error fetching variants:', variantsFetchError);
        throw variantsFetchError;
      }
      
      if (variants) {
        variantIds = variants.map(v => v.id);
      }
    }

    // 4. Fetch vendor wallets to clean up transactions
    const { data: wallets, error: walletsFetchError } = await supabaseAdmin
      .from('wallets')
      .select('id')
      .eq('vendor_id', storeId);

    if (walletsFetchError) {
      console.error('[Vendor Delete] Error fetching wallets:', walletsFetchError);
      throw walletsFetchError;
    }

    const walletIds = wallets ? wallets.map(w => w.id) : [];

    // --- STEP-BY-STEP CASCADE CLEANUP ---

    // A. Delete wallet transactions
    if (walletIds.length > 0) {
      const { error: deleteTxError } = await supabaseAdmin
        .from('wallet_transactions')
        .delete()
        .in('wallet_id', walletIds);
      if (deleteTxError) {
        console.error('[Vendor Delete] Error deleting wallet transactions:', deleteTxError);
        throw deleteTxError;
      }
    }

    // B. Delete wallets
    const { error: deleteWalletsError } = await supabaseAdmin
      .from('wallets')
      .delete()
      .eq('vendor_id', storeId);
    if (deleteWalletsError) {
      console.error('[Vendor Delete] Error deleting wallets:', deleteWalletsError);
      throw deleteWalletsError;
    }

    // C. Delete payouts
    const { error: deletePayoutsError } = await supabaseAdmin
      .from('payouts')
      .delete()
      .eq('vendor_id', storeId);
    if (deletePayoutsError) {
      console.error('[Vendor Delete] Error deleting payouts:', deletePayoutsError);
      throw deletePayoutsError;
    }

    if (productIds.length > 0) {
      // D. Delete reviews referencing products
      const { error: deleteReviewsError } = await supabaseAdmin
        .from('reviews')
        .delete()
        .in('product_id', productIds);
      if (deleteReviewsError) {
        console.error('[Vendor Delete] Error deleting reviews:', deleteReviewsError);
        throw deleteReviewsError;
      }

      // E. Delete order items referencing product variants
      if (variantIds.length > 0) {
        const { error: deleteOrderItemsError } = await supabaseAdmin
          .from('order_items')
          .delete()
          .in('variant_id', variantIds);
        if (deleteOrderItemsError) {
          console.error('[Vendor Delete] Error deleting order items:', deleteOrderItemsError);
          throw deleteOrderItemsError;
        }
      }

      // F. Delete inventories referencing variants
      if (variantIds.length > 0) {
        const { error: deleteInventoryError } = await supabaseAdmin
          .from('inventories')
          .delete()
          .in('variant_id', variantIds);
        if (deleteInventoryError) {
          console.error('[Vendor Delete] Error deleting inventories:', deleteInventoryError);
          throw deleteInventoryError;
        }
      }

      // I. Delete product variants referencing products
      const { error: deleteVariantsError } = await supabaseAdmin
        .from('product_variants')
        .delete()
        .in('product_id', productIds);
      if (deleteVariantsError) {
        console.error('[Vendor Delete] Error deleting product variants:', deleteVariantsError);
        throw deleteVariantsError;
      }

      // J. Delete products referencing the vendor
      const { error: deleteProductsError } = await supabaseAdmin
        .from('products')
        .delete()
        .in('id', productIds);
      if (deleteProductsError) {
        console.error('[Vendor Delete] Error deleting products:', deleteProductsError);
        throw deleteProductsError;
      }
    }

    // K. Delete verifications
    const { error: deleteVerifError } = await supabaseAdmin
      .from('vendor_verifications')
      .delete()
      .eq('vendor_id', storeId);
    if (deleteVerifError) {
      console.error('[Vendor Delete] Error deleting verifications:', deleteVerifError);
      throw deleteVerifError;
    }

    // L. Delete vendor record
    const { error: deleteVendorError } = await supabaseAdmin
      .from('vendors')
      .delete()
      .eq('id', storeId);

    if (deleteVendorError) {
      console.error('[Vendor Delete] Error deleting vendor:', deleteVendorError);
      throw deleteVendorError;
    }

    // M. Delete associated owner user from database & Supabase Auth
    if (ownerId) {
      // Delete roles
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', ownerId);

      // Delete notifications
      await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('user_id', ownerId);

      // Delete database user profile
      const { error: deleteUserError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', ownerId);
      if (deleteUserError) {
        console.error('[Vendor Delete] Error deleting database user profile:', deleteUserError);
      }

      // Delete Supabase Auth account
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(ownerId);
      if (deleteAuthError) {
        console.warn('[Vendor Delete] Warning: Supabase Auth user delete failed (might not exist in Auth):', deleteAuthError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Vendor Delete] Fatal exception caught:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

