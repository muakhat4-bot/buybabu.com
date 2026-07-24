-- =========================================================================
-- Villex Live Database Schema Setup
-- Paste and run this SQL query in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jyxhkjqtdscveqnknluv/sql
-- =========================================================================

-- 1. Create Core Enum Types if not exists
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('SUPER_ADMIN', 'VENDOR_ADMIN', 'CUSTOMER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vendor_status_enum AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create ROLES Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create USERS Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create USER_ROLES Table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- 5. Create VENDORS Table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    store_slug VARCHAR(255) UNIQUE NOT NULL,
    support_email VARCHAR(255) NOT NULL,
    support_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING',
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    wallet JSONB DEFAULT '{"availableBalance":0,"pendingBalance":0,"lifetimeSales":0,"lifetimeCommission":0,"transactions":[]}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create VENDOR_VERIFICATIONS Table
CREATE TABLE IF NOT EXISTS public.vendor_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    legal_name VARCHAR(255),
    tax_id VARCHAR(100),
    document_urls JSONB DEFAULT '{}'::jsonb,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Seed Initial Roles
INSERT INTO public.roles (name, description)
VALUES 
    ('SUPER_ADMIN', 'Platform Administrator'),
    ('VENDOR_ADMIN', 'Store Vendor Owner'),
    ('CUSTOMER', 'Marketplace Buyer')
ON CONFLICT (name) DO NOTHING;
