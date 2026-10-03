# Sentinel Backend

The backend is Sentinel's Node.js and TypeScript API. It provides versioned
HTTP endpoints under `/api/v1`, validates incoming data, manages application
records with Prisma, and connects to the AI, Redis, and Neo4j services.

## Run the complete stack

From the repository root, follow the [Docker setup](../README.md#docker).
Compose starts the backend with its required services and applies Prisma
migrations when the API container starts.

## Local development

From this directory:

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run prisma:validate
npm.cmd run dev
```

The `.env` values must point to services reachable from the backend. When
running it on the host alongside Docker datastores, use `localhost` and the
published ports. Inside Compose, use service names such as `postgres`, `redis`,
`neo4j`, and `ai`.

## Useful scripts

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
```

The API health endpoint is `/health`. Authentication, cases, evidence,
integrity, reporting, and analysis routes are mounted under `/api/v1`.

## Container image

The production image and pull instructions are documented at
[Sentinel Backend on Docker Hub](https://hub.docker.com/r/malaymaity/sentinel-backend).
Runtime secrets and connection strings are passed as environment variables;
never put them in the image.
