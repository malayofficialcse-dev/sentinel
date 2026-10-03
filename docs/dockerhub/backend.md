# Sentinel Backend

Node.js API for Sentinel. Applies Prisma migrations at startup; configure
PostgreSQL, Redis, Neo4j, and AI at runtime.

Pull: docker pull malaymaity/sentinel-backend:latest

From the source repository, run docker compose up -d. API port: 4000.
Health check: http://localhost:4000/health.

Use unique database passwords and JWT secrets for deployments. Never bake
secrets into the image.

Source: https://github.com/malayofficialcse-dev/sentinel
