# WebForge Studio

A professional website agency management platform for managing clients, projects, contracts, invoices/payments, messaging, and website analytics.

## Architecture

- **Frontend**: React + TypeScript with Vite, TailwindCSS, Shadcn UI, TanStack Query, Wouter routing, Recharts
- **Backend**: Express.js with TypeScript, Passport.js local auth, PostgreSQL via Drizzle ORM
- **Payments**: Stripe integration with Stripe Elements (PaymentElement) for client-side checkout
- **Database**: PostgreSQL with Drizzle ORM

## Routes

- `/` - Public landing page (unauthenticated) or redirects to /dashboard (authenticated)
- `/login` - Login/register page
- `/dashboard` - Admin/client dashboard (authenticated)
- `/clients` - Admin-only client management
- `/projects` - Project listing/management
- `/contracts` - Contract management
- `/invoices` - Invoice listing with Stripe Elements payment dialog
- `/messages` - Real-time messaging
- `/analytics` - Client-only analytics dashboard

## Data Models

- **Users**: Admin and client roles with session-based auth (scrypt password hashing)
- **Projects**: Website projects linked to clients with status tracking
- **Contracts**: Agreements tied to clients/projects with lifecycle statuses (draft/sent/signed/completed)
- **Invoices**: Payment tracking with Stripe payment intent integration
- **Messages**: Real-time messaging between admin and clients
- **Analytics Snapshots**: Website performance data (visitors, page views, bounce rate, session duration)

## Key Files

- `shared/schema.ts` - All data models and Zod schemas
- `server/auth.ts` - Passport.js authentication setup
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database operations layer
- `server/seed.ts` - Seed data for demo
- `server/db.ts` - Database connection
- `client/src/App.tsx` - Main app with routing (landing page for public, dashboard layout for auth)
- `client/src/components/app-sidebar.tsx` - Navigation sidebar
- `client/src/components/stripe-payment.tsx` - Stripe Elements payment form component
- `client/src/hooks/use-auth.ts` - Authentication hook
- `client/src/pages/landing.tsx` - Public marketing landing page
- `client/src/pages/` - All page components

## Demo Accounts

- Admin: `admin` / `admin123`
- Client: `sarah.chen` / `client123`
- Client: `james.rivera` / `client123`
- Client: `emma.wilson` / `client123`

## Stripe Integration

Stripe is used for processing invoice payments via Stripe Elements (PaymentElement). Keys stored as environment secrets:
- `STRIPE_SECRET_KEY` - Server-side Stripe operations (payment intent creation/verification)
- `STRIPE_PUBLISHABLE_KEY` - Client-side Stripe Elements initialization

Flow: Client clicks "Pay Now" on invoice -> PaymentIntent created server-side -> Stripe Elements form rendered -> Payment confirmed -> Invoice marked paid

Note: Stripe was set up via manual API key entry (not Replit integration). If issues arise, keys may need to be updated in Replit Secrets.
