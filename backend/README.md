# Sentinel investigation backend

The versioned API is available under `/api/v1`. Local development uses the existing file-backed fallback store; the Prisma schema and Docker stack provide PostgreSQL persistence and Neo4j for deployment.

## Setup

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run prisma:validate
npm.cmd run dev
```

Full dependency stack:

```powershell
docker compose up --build
npm.cmd run prisma:deploy
npm.cmd run seed
```

Development seed credentials are `admin@sentinel.local` / `ChangeMe123!`; override them with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

## Investigation flow

1. Register or login at `/api/v1/auth/register` or `/api/v1/auth/login`.
2. Send the returned JWT as `Authorization: Bearer <token>`.
3. Create a case with `POST /api/v1/cases`.
4. Upload multipart evidence to `POST /api/v1/evidence`, or submit structured input to `POST /api/v1/evidence/manual`.
5. Verify provenance with `POST /api/v1/integrity/:evidenceId/verify`.
6. Query graph context and generate a report with `POST /api/v1/reports/:caseId/generate`.

Health probes are available at `/health`, `/api/v1/health/db`, `/api/v1/health/neo4j`, and `/api/v1/health/ai`.
