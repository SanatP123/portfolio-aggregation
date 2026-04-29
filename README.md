# Portfolio Aggregation

A Next.js portfolio dashboard for connecting brokerage accounts, syncing Plaid investment data, and viewing portfolio value, holdings, activity, and allocation analytics.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Clerk authentication
- Supabase data storage
- Plaid investment account linking
- Vitest for unit tests

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

If `.env.example` is not present, create `.env.local` and add the Clerk, Supabase, and Plaid values used by the app.

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:watch
```

## Testing Approach

This project now has a first unit-test layer with Vitest. New business logic should generally be written as small pure functions first, covered with tests, then wired into React components or API routes.

Good first candidates for TDD:

- Portfolio value and allocation calculations
- Transaction normalization
- Plaid/Supabase response mapping
- API route error handling
- Empty, loading, and signed-out UI states

## AdSense

The app includes the AdSense account meta tag and global script for publisher `ca-pub-1496544894534044`.

To show the left and right dashboard rail ads:

1. Create two Display ad units in Google AdSense.
2. Copy each ad unit slot ID.
3. Add the slot IDs to `.env.local`:

```bash
NEXT_PUBLIC_ADSENSE_LEFT_SLOT=
NEXT_PUBLIC_ADSENSE_RIGHT_SLOT=
```

4. Redeploy the site so the public environment variables are included in the client bundle.

Side rail ads are desktop-only and hidden below the `xl` breakpoint.

## Project Structure

- `app/` - Next.js routes, layouts, API routes, and global styles
- `src/components/` - dashboard UI components
- `src/db/` - portfolio data access and API response types
- `src/lib/` - shared utilities and service clients
- `src/server/` - server-side Plaid and encryption helpers
- `supabase/migrations/` - database schema migrations
- `docs/` - project documentation
