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
      // Find latest verification tax/ntn if exists
      const latestVerification = v.verifications[0];
      return {
        email: v.supportEmail,
        storeName: v.storeName,
        storeId: v.id, // Using vendor ID as storeId
        firstName: v.user.firstName,
        lastName: v.user.lastName,
        phone: v.supportPhone,
        status: v.status,
        joinedDate: v.createdAt.toISOString().split('T')[0],
        verificationStatus: latestVerification?.verifiedAt ? 'APPROVED' : (v.status === 'REJECTED' ? 'REJECTED' : 'PENDING'),
        legalName: latestVerification?.legalName || null,
        ntnNumber: latestVerification?.taxId || null
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

    // Ensure they have the VENDOR_ADMIN role
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

    // Map vendor status
    let vStatus = VendorStatus.PENDING;
    if (body.status === 'ACTIVE') vStatus = VendorStatus.ACTIVE;
    if (body.status === 'SUSPENDED') vStatus = VendorStatus.SUSPENDED;
    if (body.status === 'REJECTED') vStatus = VendorStatus.REJECTED;

    const vendor = await prisma.vendor.upsert({
      where: { storeName: body.storeName },
      update: {
        status: vStatus,
        supportEmail: body.email.toLowerCase(),
        supportPhone: body.phone || ''
      },
      create: {
        ownerId: user.id,
        storeName: body.storeName,
        storeSlug,
        supportEmail: body.email.toLowerCase(),
        supportPhone: body.phone || '',
        status: vStatus,
        commissionRate: 10.00
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
    
    // Find vendor by email
    const vendor = await prisma.vendor.findFirst({
      where: { supportEmail: body.email.toLowerCase() }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    let vStatus = VendorStatus.PENDING;
    if (body.status === 'ACTIVE') vStatus = VendorStatus.ACTIVE;
    if (body.status === 'SUSPENDED') vStatus = VendorStatus.SUSPENDED;
    if (body.status === 'REJECTED') vStatus = VendorStatus.REJECTED;

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { status: vStatus }
    });

    // Update verification
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
