-- Plaid connection fields. Access tokens must only be read/written from server-side code.

alter table public.brokerage_connections
add column if not exists access_token text,
add column if not exists item_id text;

create unique index if not exists brokerage_connections_provider_item_id_uidx
on public.brokerage_connections(provider, item_id)
where item_id is not null;
