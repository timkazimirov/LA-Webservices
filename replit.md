# LA Webservices

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
- `/clients` - Admin-only client management with stage filtering (potential/negotiation/active)
- `/clients/:id` - Admin-only client profile view with tabs (Overview, Projects, Messages, Invoices)
- `/requests` - Admin-only project requests management page
- `/projects` - Project listing/management
- `/contracts` - Contract management
- `/invoices` - Invoice listing with Stripe Elements payment dialog and recurring invoice support
- `/messages` - Real-time messaging between admins and clients
- `/analytics` - Client-only analytics dashboard

## Data Models

- **Users**: Admin and client roles with session-based auth (scrypt password hashing). Clients have clientStage (potential/negotiation/active), websiteUrl, and notes fields
- **Projects**: Website projects linked to clients with status tracking
- **Contracts**: Agreements tied to clients/projects with lifecycle statuses (draft/sent/signed/completed)
- **Invoices**: Payment tracking with Stripe payment intent integration. Supports recurring invoices with isRecurring, recurringInterval (monthly/quarterly/yearly), and nextBillingDate fields
- **Messages**: Real-time messaging between admin and clients
- **Analytics Snapshots**: Website performance data (visitors, page views, bounce rate, session duration)
- **Project Requests**: Client-submitted project requests with budget/timeline/status tracking

## Key Features

- **Client Stages**: Admin can categorize clients as potential, negotiation, or active (paying)
- **Client Profiles**: Click on any client to see their full profile with projects, messages, invoices, and notes
- **Project Requests**: Clients submit requests from dashboard; admin sees them on /requests page with approve/reject/notes; badge in sidebar shows pending count
- **Recurring Invoices**: Admin creates recurring invoices with monthly/quarterly/yearly intervals; "Generate Recurring" button creates new pending invoices when billing date is due; parent invoice advances to next cycle
- **Stripe Payments**: Client clicks "Pay Now" → scrollable payment dialog with Stripe Elements → payment confirmed → invoice marked paid
- **Messaging**: Clients automatically see admin contacts; admins see all clients. Real-time polling
- **SEO**: Comprehensive local SEO for Los Angeles with structured data (JSON-LD), geo-targeting, FAQ section, sitemap, robots.txt
- **Animations**: Scroll-triggered fade-in animations, staggered grid reveals, hover transitions on landing page

## Key Files

- `shared/schema.ts` - All data models and Zod schemas
- `server/auth.ts` - Passport.js authentication setup, hashPassword and comparePasswords exports
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database operations layer
- `server/seed.ts` - Creates admin account on first run
- `server/db.ts` - Database connection
- `client/src/App.tsx` - Main app with routing (landing page for public, dashboard layout for auth)
- `client/src/components/app-sidebar.tsx` - Navigation sidebar with pending request badge
- `client/src/components/stripe-payment.tsx` - Stripe Elements payment form component
- `client/src/hooks/use-auth.ts` - Authentication hook
- `client/src/pages/landing.tsx` - Public marketing landing page with SEO and animations
- `client/src/pages/clients.tsx` - Admin client management with list/profile views
- `client/src/pages/project-requests.tsx` - Admin project requests management with approve/reject
- `client/src/pages/invoices.tsx` - Invoice management with recurring support and scrollable payment dialog
- `client/src/pages/dashboard.tsx` - Admin dashboard + client dashboard with project request flow
- `client/src/pages/messages.tsx` - Messaging between admins and clients

## Admin Account

- Username: `admin`
- Password: `tmkpotato123`
- Email: `admin@lawebservices.com`

## Stripe Integration

Stripe is used for processing invoice payments via Stripe Elements (PaymentElement). Keys stored as environment secrets:
- `STRIPE_SECRET_KEY` - Server-side Stripe operations (payment intent creation/verification)
- `STRIPE_PUBLISHABLE_KEY` - Client-side Stripe Elements initialization

Flow: Client clicks "Pay Now" on invoice -> PaymentIntent created server-side -> Stripe Elements form rendered -> Payment confirmed -> Invoice marked paid

## Recurring Invoice Flow

1. Admin creates invoice with "Recurring" toggle on, selects interval (monthly/quarterly/yearly)
2. Invoice saved with isRecurring=true, recurringInterval, and nextBillingDate set to first interval
3. Admin clicks "Generate Recurring" button on invoices page
4. Backend checks all recurring invoices where nextBillingDate <= now
5. Creates new pending invoice for each due recurring invoice
6. Advances parent's nextBillingDate to next cycle
7. Each generated invoice can be paid individually via Stripe

## Branding

- Name: LA Webservices
- Logo: attached_assets/la-webservices-logo.png (used on landing page, login page, footer only - NOT in sidebar)
- Sidebar uses text "LA" badge instead of logo image
