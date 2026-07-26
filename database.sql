-- ============================================================
-- EAZOPE COFFEE — SUPABASE DATABASE SETUP (v2)
-- Safe to re-run: existing table, policies, indexes are
-- dropped/skipped before being recreated.
-- ============================================================

-- 1. Create the orders table (no-op if it already exists)
CREATE TABLE IF NOT EXISTS public.orders (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at      TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name   TEXT NOT NULL,
    customer_phone  TEXT NOT NULL,
    items           JSONB NOT NULL DEFAULT '[]'::JSONB,
    total_amount    NUMERIC(10,2) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending',
    notes           TEXT,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled'))
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to place an order (anonymous insert only)
-- Matches the website: it inserts a row and does NOT ask for it
-- back, so no SELECT policy is needed for the order form to work.
DROP POLICY IF EXISTS "Allow anonymous order creation" ON public.orders;
CREATE POLICY "Allow anonymous order creation"
    ON public.orders
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 4. Admin/dashboard access:
-- Do NOT add a public SELECT policy for the anon key — that would
-- let any website visitor read every customer's name, phone number,
-- and order history. To manage orders, use the Supabase Table
-- Editor (logged into your dashboard) or the service_role key on a
-- trusted backend — both bypass RLS automatically, no policy needed.

-- 5. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 6. Enable Realtime, only if not already enabled (avoids the
-- "relation is already member of publication" error on re-run)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
END $$;

-- ============================================================
-- DONE.
-- Your SUPABASE_URL and SUPABASE_ANON_KEY go in config.js, not
-- in this file or in EazopeCoffee.html directly.
-- ============================================================
