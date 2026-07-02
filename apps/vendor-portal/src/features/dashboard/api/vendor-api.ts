export interface MockVendorProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
}

export interface MockStoreInfo {
  id: string;
  ownerId: string;
  storeName: string;
  storeSlug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  supportEmail: string;
  supportPhone: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
}

export interface RegisteredVendor {
  email: string;
  password?: string;
  storeName: string;
  storeId?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  ownerId?: string;
  storeDescription?: string;
  supportEmail?: string;
  supportPhone?: string;
  status?: string;
  verificationStatus?: string;
}

export interface MockJwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateMockJwt(payload: MockJwtPayload): string {
  if (typeof window === 'undefined') return '';
  const header = window.btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const data = window.btoa(JSON.stringify(payload));
  return `${header}.${data}.mocksignature`;
}

export function decodeMockJwt(token: string): MockJwtPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadPart = parts[1];
    if (!payloadPart) return null;
    return JSON.parse(window.atob(payloadPart)) as MockJwtPayload;
  } catch {
    return null;
  }
}

export const vendorApi = {
  // GET /auth/me
  getMe: async (token: string): Promise<MockVendorProfile> => {
    const payload = decodeMockJwt(token);
    if (!payload || !payload.userId) {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch('/api/vendors');
      const registeredVendors: RegisteredVendor[] = await response.json();
      
      const matched = registeredVendors.find(
        (v) => v.email.toLowerCase() === payload.email.toLowerCase()
      );

      if (!matched) {
        throw new Error('User not found');
      }

      return {
        id: payload.userId,
        email: matched.email,
        firstName: matched.firstName,
        lastName: matched.lastName,
        phone: matched.phone,
        role: 'STORE MANAGER',
      };
    } catch {
      // Fallback to localStorage if API is down
      const stored = typeof window !== 'undefined' ? localStorage.getItem('villex_registered_vendors') : null;
      const registeredVendors: RegisteredVendor[] = stored ? JSON.parse(stored) : [];
      const matched = registeredVendors.find(
        (v) => v.email.toLowerCase() === payload.email.toLowerCase()
      );

      if (!matched) {
        throw new Error('User not found');
      }

      return {
        id: payload.userId,
        email: matched.email,
        firstName: matched.firstName,
        lastName: matched.lastName,
        phone: matched.phone,
        role: 'STORE MANAGER',
      };
    }
  },

  // GET /vendor/profile & GET /vendor/store
  getStore: async (token: string): Promise<MockStoreInfo> => {
    const payload = decodeMockJwt(token);
    if (!payload || !payload.userId) {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch('/api/vendors');
      const registeredVendors: RegisteredVendor[] = await response.json();
      
      const matched = registeredVendors.find(
        (v) => v.email.toLowerCase() === payload.email.toLowerCase()
      );

      if (!matched) {
        throw new Error('Store not found');
      }

      return {
        id: matched.storeId || `#VLX-MER-${Math.floor(100 + Math.random() * 900)}`,
        ownerId: payload.userId,
        storeName: matched.storeName,
        storeSlug: matched.storeName.toLowerCase().replace(/\s+/g, '-'),
        description: matched.storeDescription,
        supportEmail: matched.supportEmail || matched.email,
        supportPhone: matched.supportPhone || matched.phone || '',
        status: (matched.status as MockStoreInfo['status']) || 'PENDING',
      };
    } catch {
      // Fallback to localStorage
      const stored = typeof window !== 'undefined' ? localStorage.getItem('villex_registered_vendors') : null;
      const registeredVendors: RegisteredVendor[] = stored ? JSON.parse(stored) : [];
      const matched = registeredVendors.find(
        (v) => v.email.toLowerCase() === payload.email.toLowerCase()
      );

      if (!matched) {
        throw new Error('Store not found');
      }

      return {
        id: matched.storeId || `#VLX-MER-${Math.floor(100 + Math.random() * 900)}`,
        ownerId: payload.userId,
        storeName: matched.storeName,
        storeSlug: matched.storeName.toLowerCase().replace(/\s+/g, '-'),
        description: matched.storeDescription,
        supportEmail: matched.supportEmail || matched.email,
        supportPhone: matched.supportPhone || matched.phone || '',
        status: (matched.status as MockStoreInfo['status']) || 'PENDING',
      };
    }
  },
};
