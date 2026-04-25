-- Portfolio aggregation core schema.
-- This keeps your existing public.users_data table working while adding normalized tables
-- for future brokerage integrations such as Plaid, SnapTrade, Fidelity, Schwab, and Robinhood.

create extension if not exists pgcrypto;

create table if not exists public.brokerage_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  provider text not null,
  provider_connection_id text,
  institution_name text not null,
  institution_logo_url text,
  status text not null default 'connected' check (status in ('connected', 'needs_reauth', 'syncing', 'failed', 'disconnected')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_connection_id)
);

create table if not exists public.brokerage_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  connection_id uuid references public.brokerage_connections(id) on delete cascade,
  provider_account_id text,
  institution_name text not null,
  account_name text not null,
  account_type text not null default 'investment',
  account_subtype text,
  currency text not null default 'USD',
  cash_balance numeric(18, 4) not null default 0,
  total_value numeric(18, 4) not null default 0,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (connection_id, provider_account_id)
);

create table if not exists public.securities (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  name text,
  security_type text not null default 'equity',
  exchange text,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (symbol, exchange, currency)
);

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  account_id uuid references public.brokerage_accounts(id) on delete cascade,
  security_id uuid references public.securities(id),
  symbol text not null,
  name text,
  quantity numeric(24, 8) not null default 0,
  price numeric(18, 6) not null default 0,
  market_value numeric(18, 4) not null default 0,
  cost_basis numeric(18, 4),
  currency text not null default 'USD',
  as_of timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, symbol)
);

create table if not exists public.investment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  account_id uuid references public.brokerage_accounts(id) on delete cascade,
  provider_transaction_id text,
  transaction_type text not null check (transaction_type in ('buy', 'sell', 'dividend', 'deposit', 'withdrawal', 'fee', 'transfer', 'other')),
  symbol text,
  quantity numeric(24, 8),
  price numeric(18, 6),
  amount numeric(18, 4) not null,
  currency text not null default 'USD',
  transaction_date date not null,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, provider_transaction_id)
);

create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  snapshot_date date not null,
  total_value numeric(18, 4) not null default 0,
  cash_value numeric(18, 4) not null default 0,
  invested_value numeric(18, 4) not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  unique (user_id, snapshot_date, currency)
);

create table if not exists public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  connection_id uuid references public.brokerage_connections(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists brokerage_connections_user_id_idx on public.brokerage_connections(user_id);
create index if not exists brokerage_accounts_user_id_idx on public.brokerage_accounts(user_id);
create index if not exists holdings_user_id_idx on public.holdings(user_id);
create index if not exists holdings_account_id_idx on public.holdings(account_id);
create index if not exists investment_transactions_user_id_idx on public.investment_transactions(user_id);
create index if not exists investment_transactions_account_id_idx on public.investment_transactions(account_id);
create index if not exists portfolio_snapshots_user_id_date_idx on public.portfolio_snapshots(user_id, snapshot_date desc);
create index if not exists sync_jobs_user_id_created_at_idx on public.sync_jobs(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_brokerage_connections_updated_at
before update on public.brokerage_connections
for each row execute function public.set_updated_at();

create or replace trigger set_brokerage_accounts_updated_at
before update on public.brokerage_accounts
for each row execute function public.set_updated_at();

create or replace trigger set_securities_updated_at
before update on public.securities
for each row execute function public.set_updated_at();

create or replace trigger set_holdings_updated_at
before update on public.holdings
for each row execute function public.set_updated_at();

create or replace trigger set_investment_transactions_updated_at
before update on public.investment_transactions
for each row execute function public.set_updated_at();

-- Helpful portfolio summary view. Your app can eventually read from this instead of users_data.data.
create or replace view public.portfolio_summary as
select
  a.user_id,
  coalesce(sum(a.total_value), 0)::numeric(18, 4) as total_value,
  coalesce(sum(a.cash_balance), 0)::numeric(18, 4) as cash_value,
  coalesce(sum(a.total_value - a.cash_balance), 0)::numeric(18, 4) as invested_value,
  count(distinct a.id) as account_count,
  max(a.last_synced_at) as last_synced_at
from public.brokerage_accounts a
group by a.user_id;

-- Keep RLS disabled for local development if that is how your current users_data table is working.
-- Before production, enable RLS and route writes through server-side Clerk-authenticated API routes.
alter table public.brokerage_connections disable row level security;
alter table public.brokerage_accounts disable row level security;
alter table public.securities disable row level security;
alter table public.holdings disable row level security;
alter table public.investment_transactions disable row level security;
alter table public.portfolio_snapshots disable row level security;
alter table public.sync_jobs disable row level security;
