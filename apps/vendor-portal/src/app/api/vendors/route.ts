import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VendorStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        user: true,
        verifications: true
      }
    });

    const mapped = vendors.map(v => {
      const latestVerification = v.verifications[0];
      return {
        email: v.supportEmail,
        storeName: v.storeName,
        storeId: v.id,
        firstName: v.user.firstName,
        lastName: v.user.lastName,
        phone: v.supportPhone,
        status: v.status,
        joinedDate: v.createdAt.toISOString().split('T')[0],
        verificationStatus: latestVerification?.verifiedAt ? 'APPROVED' : (v.status === 'REJECTED' ? 'REJECTED' : 'PENDING'),
        legalName: latestVerification?.legalName || null,
        ntnNumber: latestVerification?.taxId || null,
        wallet: v.wallet || { availableBalance: 0, pendingBalance: 0, lifetimeSales: 0, lifetimeCommission: 0, transactions: [] }
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
    
    // Find or create user
    const user = await prisma.user.upsert({
      where: { email: body.email.toLowerCase() },
      update: {
        firstName: body.firstName || body.storeName.split(' ')[0] || 'Owner',
        lastName: body.lastName || 'Owner',
        phone: body.phone || ''
      },
      create: {
        email: body.email.toLowerCase(),
        passwordHash: '$2b$10$devSaltPlaceholderForHashedPasswords1234567890',
        firstName: body.firstName || body.storeName.split(' ')[0] || 'Owner',
        lastName: body.lastName || 'Owner',
        phone: body.phone || ''
      }
    });

    const role = await prisma.role.findFirst({ where: { name: 'VENDOR_ADMIN' } });
    if (role) {
      await prisma.userRoleLink.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          roleId: role.id
        }
      });
    }

    const storeSlug = body.storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    let vStatus = VendorStatus.PENDING;
    if (body.status === 'ACTIVE') vStatus = VendorStatus.ACTIVE;
    if (body.status === 'SUSPENDED') vStatus = VendorStatus.SUSPENDED;
    if (body.status === 'REJECTED') vStatus = VendorStatus.REJECTED;

    const vendor = await prisma.vendor.upsert({
      where: { storeName: body.storeName },
      update: {
        status: vStatus,
        supportEmail: body.email.toLowerCase(),
        supportPhone: body.phone || '',
        wallet: body.wallet || null
      },
      create: {
        ownerId: user.id,
        storeName: body.storeName,
        storeSlug,
        supportEmail: body.email.toLowerCase(),
        supportPhone: body.phone || '',
        status: vStatus,
        commissionRate: 10.00,
        wallet: body.wallet || { availableBalance: 0, pendingBalance: 0, lifetimeSales: 0, lifetimeCommission: 0, transactions: [] }
      }
    });

    if (body.ntnNumber) {
      await prisma.vendorVerification.create({
        data: {
          vendorId: vendor.id,
          legalName: body.legalName || body.storeName,
          taxId: body.ntnNumber,
          documentUrls: {},
          verifiedAt: body.verificationStatus === 'APPROVED' ? new Date() : null
        }
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

    if (body.action === 'request_withdrawal') {
      const { email, amount } = body;
      if (!email || !amount) {
        return NextResponse.json({ success: false, error: 'Email and amount are required' }, { status: 400 });
      }

      const vendor = await prisma.vendor.findFirst({
        where: { supportEmail: email.toLowerCase() }
      });

      if (!vendor) {
        return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
      }

      const wallet = (vendor.wallet as any) || { availableBalance: 0, pendingBalance: 0, lifetimeSales: 0, lifetimeCommission: 0, transactions: [] };
      if (wallet.availableBalance < amount) {
        return NextResponse.json({ success: false, error: 'Insufficient available balance' }, { status: 400 });
      }

      wallet.availableBalance -= amount;
      const today = new Date().toISOString().slice(0, 10);
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

      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { wallet }
      });

      return NextResponse.json({ success: true });
    }

    if (body.action === 'approve_withdrawal') {
      const txId = body.transactionId;
      if (!txId) {
        return NextResponse.json({ success: false, error: 'transactionId is required' }, { status: 400 });
      }

      const vendors = await prisma.vendor.findMany();
      const vendor = vendors.find((v: any) => {
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

      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { wallet }
      });

      return NextResponse.json({ success: true });
    }

    if (body.action === 'pay_withdrawal') {
      const txId = body.transactionId;
      if (!txId) {
        return NextResponse.json({ success: false, error: 'transactionId is required' }, { status: 400 });
      }

      const vendors = await prisma.vendor.findMany();
      const vendor = vendors.find((v: any) => {
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

      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { wallet }
      });

      return NextResponse.json({ success: true });
    }

    if (body.action === 'reject_withdrawal') {
      const txId = body.transactionId;
      if (!txId) {
        return NextResponse.json({ success: false, error: 'transactionId is required' }, { status: 400 });
      }

      const vendors = await prisma.vendor.findMany();
      const vendor = vendors.find((v: any) => {
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

      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { wallet }
      });

      return NextResponse.json({ success: true });
    }

    // Default update profile details
    const email = body.email;
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const vendor = await prisma.vendor.findFirst({
      where: { supportEmail: email.toLowerCase() }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    let vStatus = vendor.status;
    if (body.status === 'ACTIVE') vStatus = VendorStatus.ACTIVE;
    if (body.status === 'SUSPENDED') vStatus = VendorStatus.SUSPENDED;
    if (body.status === 'REJECTED') vStatus = VendorStatus.REJECTED;

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        status: vStatus
      }
    });

    const verification = await prisma.vendorVerification.findFirst({
      where: { vendorId: vendor.id }
    });

    if (verification) {
      await prisma.vendorVerification.update({
        where: { id: verification.id },
        data: {
          verifiedAt: body.verificationStatus === 'APPROVED' ? new Date() : null
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
