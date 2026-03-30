# WordQuest Kids v2.1

Monorepo for a production-oriented English vocabulary learning platform for children (10 and 13 age tracks).

## Architecture

- `apps/web`: Next.js frontend (Child, Parent, Admin experiences)
- `apps/api`: NestJS backend (Auth, RBAC, SRS scheduling, task generation)
- `packages/shared`: Shared types and SRS logic
- `packages/content-tools`: Content import scripts for word packs and assets
- `content/`: Source content and media assets (word packs, audio, images)

## Quick Start

1. Install Node.js 20+ and npm 10+
2. Install dependencies

```bash
npm install
```

3. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

4. Start PostgreSQL and update `DATABASE_URL`.
5. Generate Prisma client and run migrations.

```bash
npm --workspace @wordquest/api run prisma:generate
npm --workspace @wordquest/api run prisma:migrate
```

6. Seed data

```bash
npm run seed
```

7. Run services in two terminals

```bash
npm run dev:api
npm run dev:web
```

## OAuth Setup

Use Google Cloud Console to configure OAuth credentials.

- API callback: `https://api.wordgames.games/auth/google/callback` (or local fallback)
- Frontend origin: `https://wordgames.games`

## Notes

- First admin is promoted automatically if email is listed in `ADMIN_EMAILS`.
- Default expected first admin: `xiayiping@gmail.com`.
- Reports in v2.1 MVP are page-based views (no file export yet).
