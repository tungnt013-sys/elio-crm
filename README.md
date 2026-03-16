# Elio CRM MVP

This folder contains a production-oriented MVP scaffold built from `elio-crm-v3-final-spec.md`.

## Includes

- Next.js App Router scaffold with role-based dashboard routes
- Prisma schema covering all core CRM entities and enums
- Seed script with staff/pricing/automation defaults
- NextAuth v5 + Google SSO scaffold
- RBAC utility mapped to the spec matrix
- APIs for webhook intake, students, search, pipeline, activities, meetings, proposals, pricing, automations, contracts, cron email
- Core UI components: search, pipeline kanban, loss-reason modal, activity timeline, meeting notes, proposals, pricing table, contracts table

## Run

1. Copy `.env.example` to `.env.local` and fill values.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npm run prisma:generate`
4. Run migrations: `npm run prisma:migrate -- --name init`
5. Seed: `npm run prisma:seed`
6. Start app: `npm run dev`

## Notes

- pg_trgm extension/index SQL is included under `prisma/migrations/0001_init/migration.sql`.
- `scripts/migrate-from-excel.ts` is currently a scaffold; implement full mapping before historical import.
