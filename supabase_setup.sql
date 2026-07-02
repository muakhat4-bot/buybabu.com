-- =========================================================================
-- Supabase Row Level Security (RLS) & Storage Bucket Policies Setup
-- =========================================================================

-- 1. Enable Row Level Security (RLS) on core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2. Define Table-Level Row Level Security Policies

-- USERS Table Policies:
-- Users can view and update their own user profile data
CREATE POLICY "Users can read their own profile" ON public.users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- VENDORS Table Policies:
-- Vendors can view their own profile; Super Admins can view/update all vendors
CREATE POLICY "Vendors can view their own profile" ON public.vendors
    FOR SELECT TO authenticated
    USING (auth.uid() = owner_id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'SUPER_ADMIN');

CREATE POLICY "Vendors can update their own profile" ON public.vendors
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'SUPER_ADMIN');

-- PRODUCTS Table Policies:
-- Anyone can view published products; vendors can read/write their own products
CREATE POLICY "Anyone can view published products" ON public.products
    FOR SELECT
    USING (status = 'PUBLISHED' OR auth.uid() IN (SELECT owner_id FROM public.vendors WHERE id = vendor_id));

CREATE POLICY "Vendors can write their own products" ON public.products
    FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT owner_id FROM public.vendors WHERE id = vendor_id));

-- ORDERS Table Policies:
-- Customers can view their own orders; vendors can view order items belonging to their store
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'SUPER_ADMIN');

-- WALLET_TRANSACTIONS Table Policies:
-- Vendors can view their own transactions; Super Admins can view all
CREATE POLICY "Vendors can view their wallet transactions" ON public.wallet_transactions
    FOR SELECT TO authenticated
    USING (
        wallet_id IN (
            SELECT id FROM public.wallets WHERE vendor_id IN (
                SELECT id FROM public.vendors WHERE owner_id = auth.uid()
            )
        )
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'SUPER_ADMIN'
    );

-- 3. Storage Bucket Access Policies
-- Ensure only authenticated users can upload files, and anyone can read public URLs

-- Helper to provision storage policies
CREATE POLICY "Allow public select on all buckets" ON storage.objects
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated inserts on product images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images' OR bucket_id = 'product-gallery');

CREATE POLICY "Allow authenticated inserts on logos and banners" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'vendor-logos' OR bucket_id = 'vendor-banners');

CREATE POLICY "Allow authenticated inserts on user avatars" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'customer-avatars');

CREATE POLICY "Allow authenticated inserts on documents and invoices" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documents' OR bucket_id = 'invoices');

CREATE POLICY "Allow authenticated deletes for owners" ON storage.objects
    FOR DELETE TO authenticated
    USING (auth.uid() = owner);
