# Calcora — Production Deployment Brief

This document provides step-by-step instructions for deploying Calcora to Vercel and CockroachDB Serverless / PostgreSQL.

---

## 1. Target Infrastructure

- **Frontend & API Hosting**: Vercel
- **Database**: CockroachDB Serverless (PostgreSQL wire-compatible, 10 GiB free storage)
- **Cache & Rate Limiting**: Upstash Redis (Optional)
- **Domain**: calcora.com (or approved `.com` backup)

---

## 2. Pre-Deployment Verification Checklist

Before deploying, ensure all validation checks pass locally:

- [x] Automated unit test suite passes: `npm test`
- [x] TypeScript type checking passes: `npx tsc --noEmit`
- [x] Next.js build succeeds with zero errors: `npm run build`
- [x] No hard-coded localhost URLs or development secrets in source code.

---

## 3. Environment Variables Configuration

Set up the following environment variables in Vercel Project Settings:

```env
DATABASE_URL="postgresql://user:password@cluster-name.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full"
DIRECT_URL="postgresql://user:password@cluster-name.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full"
NEXTAUTH_URL="https://calcora.com"
NEXTAUTH_SECRET="<generate-fresh-32-char-secret>"
NEXT_PUBLIC_SITE_URL="https://calcora.com"
ADMIN_EMAIL="admin@calcora.com"
```

---

## 4. Database Initialization

1. Provision a CockroachDB Serverless database cluster.
2. Apply Prisma schema migrations to production:
   ```bash
   npx prisma migrate deploy
   ```
3. Set up the `calculator_usage` retention/aggregation cron job in Vercel Cron (`/api/cron/aggregate-usage`).

---

## 5. Post-Deploy Verification Matrix

- Verify homepage loads over HTTPS on `calcora.com`.
- Test calculation accuracy on all 7 launch calculators.
- Verify `/sitemap.xml` and `/robots.txt` render correctly.
- Test printable amortization schedule and PDF export.
- Verify protected admin portal at `/admin`.
