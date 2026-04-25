-- Production security baseline.
-- App access should go through Clerk-authenticated Next.js API routes using the Supabase service role key.
-- The browser anon key should not be able to read/write portfolio tables directly.

alter table public.users_data enable row level security;
alter table public.brokerage_connections enable row level security;
alter table public.brokerage_accounts enable row level security;
alter table public.securities enable row level security;
alter table public.holdings enable row level security;
alter table public.investment_transactions enable row level security;
alter table public.portfolio_snapshots enable row level security;
alter table public.sync_jobs enable row level security;

revoke all on table public.users_data from anon, authenticated;
revoke all on table public.brokerage_connections from anon, authenticated;
revoke all on table public.brokerage_accounts from anon, authenticated;
revoke all on table public.securities from anon, authenticated;
revoke all on table public.holdings from anon, authenticated;
revoke all on table public.investment_transactions from anon, authenticated;
revoke all on table public.portfolio_snapshots from anon, authenticated;
revoke all on table public.sync_jobs from anon, authenticated;
revoke all on table public.portfolio_summary from anon, authenticated;

-- If this view is ever used directly again, keep it subject to the caller's permissions.
alter view public.portfolio_summary set (security_invoker = true);

-- Existing permissive policies, if any were added during local testing, should be removed manually.
-- Service role bypasses RLS; never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
