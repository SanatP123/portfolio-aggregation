-- Optional demo backfill from the current users_data JSON shape into normalized tables.
-- Safe to run more than once for the same user/symbols because it uses upserts.

insert into public.brokerage_connections (
  user_id,
  provider,
  provider_connection_id,
  institution_name,
  status,
  last_synced_at
)
select
  ud.user_id,
  'manual' as provider,
  'manual-' || ud.user_id as provider_connection_id,
  'Manual portfolio' as institution_name,
  'connected' as status,
  now() as last_synced_at
from public.users_data ud
where ud.data ? 'holdings'
on conflict (provider, provider_connection_id) do update set
  status = excluded.status,
  last_synced_at = excluded.last_synced_at;

insert into public.brokerage_accounts (
  user_id,
  connection_id,
  provider_account_id,
  institution_name,
  account_name,
  account_type,
  currency,
  cash_balance,
  total_value,
  last_synced_at
)
select
  ud.user_id,
  bc.id,
  'manual-account-' || ud.user_id as provider_account_id,
  'Manual portfolio' as institution_name,
  'Manual holdings' as account_name,
  'investment' as account_type,
  'USD' as currency,
  0 as cash_balance,
  coalesce((ud.data->>'totalValue')::numeric, 0) as total_value,
  now() as last_synced_at
from public.users_data ud
join public.brokerage_connections bc
  on bc.user_id = ud.user_id
 and bc.provider = 'manual'
 and bc.provider_connection_id = 'manual-' || ud.user_id
where ud.data ? 'holdings'
on conflict (connection_id, provider_account_id) do update set
  total_value = excluded.total_value,
  last_synced_at = excluded.last_synced_at;

insert into public.securities (symbol, name, security_type, currency)
select distinct
  holding->>'symbol' as symbol,
  holding->>'symbol' as name,
  'equity' as security_type,
  'USD' as currency
from public.users_data ud
cross join lateral jsonb_array_elements(ud.data->'holdings') as holding
where ud.data ? 'holdings'
  and holding ? 'symbol'
on conflict (symbol, exchange, currency) do nothing;

insert into public.holdings (
  user_id,
  account_id,
  security_id,
  symbol,
  name,
  quantity,
  price,
  market_value,
  currency,
  as_of
)
select
  ud.user_id,
  ba.id as account_id,
  s.id as security_id,
  holding->>'symbol' as symbol,
  holding->>'symbol' as name,
  coalesce((holding->>'quantity')::numeric, 0) as quantity,
  coalesce((holding->>'price')::numeric, 0) as price,
  coalesce((holding->>'quantity')::numeric, 0) * coalesce((holding->>'price')::numeric, 0) as market_value,
  'USD' as currency,
  now() as as_of
from public.users_data ud
join public.brokerage_connections bc
  on bc.user_id = ud.user_id
 and bc.provider = 'manual'
 and bc.provider_connection_id = 'manual-' || ud.user_id
join public.brokerage_accounts ba
  on ba.connection_id = bc.id
 and ba.provider_account_id = 'manual-account-' || ud.user_id
cross join lateral jsonb_array_elements(ud.data->'holdings') as holding
left join public.securities s
  on s.symbol = holding->>'symbol'
 and s.currency = 'USD'
where ud.data ? 'holdings'
  and holding ? 'symbol'
on conflict (account_id, symbol) do update set
  quantity = excluded.quantity,
  price = excluded.price,
  market_value = excluded.market_value,
  as_of = excluded.as_of,
  security_id = excluded.security_id;

insert into public.portfolio_snapshots (
  user_id,
  snapshot_date,
  total_value,
  cash_value,
  invested_value,
  currency
)
select
  ud.user_id,
  current_date,
  coalesce((ud.data->>'totalValue')::numeric, 0),
  0,
  coalesce((ud.data->>'totalValue')::numeric, 0),
  'USD'
from public.users_data ud
where ud.data ? 'totalValue'
on conflict (user_id, snapshot_date, currency) do update set
  total_value = excluded.total_value,
  cash_value = excluded.cash_value,
  invested_value = excluded.invested_value;
