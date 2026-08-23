# Calcora — Production-Ready Online Calculator Platform

Calcora is an independent, SEO-first online calculator platform offering fast, accurate, and professionally designed tools for financial, health, math, date/time, and educational calculations.

---

## Key Features

- **7 Production Launch Calculators**:
  1. **Age Calculator**: Exact years/months/days, total months/weeks/days, zodiac sign, leap year & Feb 29 birth handling.
  2. **BMI Calculator**: Metric (kg/cm) and Imperial (lb/ft-in) units, healthy weight ranges, category badges, medical disclaimers.
  3. **Percentage Calculator**: 6 modes (X% of Y, X as % of Y, % increase, % decrease, % difference, reverse %) with live worked examples updating as you type.
  4. **GPA Calculator**: Dynamic course adding/removing, standard 4.0 scale + custom user-defined letter grade to point scale builder.
  5. **Discount Calculator**: Original price, sale price, stacked/sequential vs combined discounts, post-discount tax %, and tip %.
  6. **Loan Calculator**: Periodic payments, total interest, total cost, and full downloadable/printable amortization schedules (monthly, quarterly, yearly).
  7. **Date Calculator**: Add/subtract dates, exact date differences, and Monday-Friday business day counter.
- **Shared Calculation Engine**: Decimal-safe math, standard round-half-up rounding, full intermediate precision.
- **Guest-to-Account Favorites Migration**: Guest local storage favorites seamlessly merge into user accounts upon sign-in.
- **Usage Retention Cron Job**: Aggregates `calculator_usage` older than 7 days into daily summaries and purges raw rows beyond 90 days.
- **Admin Control Dashboard (`/admin`)**: SEO metadata manager, ad placement toggles (Header, Sidebar, In-Content, Below Results, Footer), audit logs.
- **SEO First**: Dynamic `/sitemap.xml`, `/robots.txt`, Schema.org JSON-LD structured data (`WebApplication`, `BreadcrumbList`, `FAQPage`, `WebSite`).

---

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, React 19, Tailwind CSS.
- **Database & ORM**: Prisma ORM, compatible with PostgreSQL / CockroachDB Serverless.
- **Math Engine**: Plain TypeScript deterministic client-side calculation engine.
- **Search**: Client-side fuzzy matching via Fuse.js.
- **Testing**: Vitest unit test suite.

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env

# 3. Initialize Prisma database
npx prisma db push

# 4. Run automated test matrix
npm test

# 5. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Deployment

Refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md) for step-by-step production deployment instructions to Vercel and CockroachDB Serverless.
"# Numvax" 
