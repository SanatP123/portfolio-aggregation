# Supabase Portfolio Schema

The current app reads from `public.users_data`:

```txt
users_data
- id
- user_id
- data jsonb
```

`data` should be `jsonb`, not plain `json`, because the backfill uses Postgres JSONB operators such as `?`.

Keep that table for now so the dashboard keeps working. The new normalized schema adds tables beside it for brokerage aggregation.

## Migration Order

Run these files in Supabase SQL Editor:

1. `supabase/migrations/001_portfolio_core.sql`
2. Optional: `supabase/migrations/002_backfill_users_data_demo.sql`

The optional backfill copies the current JSON holdings into a fake `manual` brokerage connection so you can test the new tables before integrating Plaid/SnapTrade.

## Server API Environment

The Next.js API routes use a server-only Supabase service role key. Add this to `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PLAID_TOKEN_ENCRYPTION_KEY=a-long-random-secret
CRON_SECRET=a-long-random-secret
```

Never prefix this with `NEXT_PUBLIC_`; it must not be exposed to the browser.

`PLAID_TOKEN_ENCRYPTION_KEY` encrypts newly stored Plaid access tokens. Existing unencrypted sandbox tokens still work as a fallback, but production tokens should be stored encrypted.

`CRON_SECRET` protects the scheduled sync endpoint. Vercel Cron should call `/api/cron/sync-portfolios` with `Authorization: Bearer <CRON_SECRET>` if you require this header outside Vercel's managed execution.

## Plaid Sync Route

After a user connects Plaid, call:

```txt
POST /api/plaid/sync
```

The route uses the stored Plaid `access_token`, fetches investment accounts and holdings from Plaid, then upserts into:

```txt
brokerage_accounts
securities
holdings
investment_transactions
portfolio_snapshots
sync_jobs
```

Investment transactions can be unavailable immediately after Link. If Plaid returns `PRODUCT_NOT_READY`, the route still syncs holdings and returns a warning so you can try again later.

## Production Security

Run `supabase/migrations/004_production_security_rls.sql` before production. It enables RLS and revokes browser-role table access so portfolio data is accessed through server API routes only.

## Core Tables

`brokerage_connections`: one row per linked institution/provider connection.

`brokerage_accounts`: one row per investment account under a connection.

`securities`: reusable security metadata, such as AAPL or TSLA.

`holdings`: current positions per account.

`investment_transactions`: normalized buy/sell/dividend/deposit/withdrawal activity.

`portfolio_snapshots`: daily total-value history for charts.

`sync_jobs`: records manual or scheduled sync attempts.

## Current JSON Mapping

Current JSON:

```json
{
  "holdings": [
    { "symbol": "AAPL", "quantity": 10, "price": 180 },
    { "symbol": "TSLA", "quantity": 5, "price": 250 }
  ],
  "totalValue": 12500
}
```

Normalized mapping:

```txt
users_data.user_id -> brokerage_connections.user_id
users_data.data.totalValue -> brokerage_accounts.total_value
holding.symbol -> securities.symbol and holdings.symbol
holding.quantity -> holdings.quantity
holding.price -> holdings.price
holding.quantity * holding.price -> holdings.market_value
```

## Important Security Note

The migrations disable RLS for local development because the existing app is using the browser Supabase anon client. Before production, you should:

1. Re-enable RLS.
2. Move brokerage writes/syncs to server-side API routes.
3. Authorize those routes with Clerk.
4. Use a Supabase service role key only on the server.

Do not store brokerage credentials yourself. Use a provider such as Plaid Investments or SnapTrade.
