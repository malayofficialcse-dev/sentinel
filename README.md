# Sentinel

**An investigation workspace for organizing evidence, analyzing risk, and
connecting related entities.**

Sentinel combines a React web application, a versioned Node.js API, and a
Python AI service. PostgreSQL stores application data, Neo4j supports graph
investigations, and Redis provides queue infrastructure.

## What you can do

- Create and manage investigation cases.
- Submit evidence for analysis and review extracted text, entities, and
  indicators.
- Explore relationships between cases, evidence, and entities in graph views.
- Review risk signals, investigation findings, and generated reports.
- Use role-aware workspaces for reporters, investigators, and administrators.

AI-assisted analysis is an aid for investigation, not a substitute for human
review.

## Docker

| Service | Docker image | Purpose |
| --- | --- | --- |
| Web | [`malaymaity/sentinel-frontend`](https://hub.docker.com/r/malaymaity/sentinel-frontend) | React application, served by Nginx |
| API | [`malaymaity/sentinel-backend`](https://hub.docker.com/r/malaymaity/sentinel-backend) | Node.js API and database migrations |
| AI | [`malaymaity/sentinel-ai`](https://hub.docker.com/r/malaymaity/sentinel-ai) | Python analysis and evidence-processing API |

Requirements: Docker Desktop or Docker Engine with the Compose plugin.

Pull the published images and start the full stack:

```powershell
docker compose pull
docker compose up -d
docker compose ps
```

Open the app at <http://localhost:8080>. The API health endpoint is
<http://localhost:4000/health>. To build the application images from source:

```powershell
docker compose build frontend backend ai
docker compose up -d
```

Stop the stack with `docker compose down`. Named volumes preserve database,
graph, and upload data. `docker compose down --volumes` also deletes that data;
use it only when you intend to remove it.

### Secrets

Compose includes development-only fallback credentials to make local
evaluation easy. **Do not use the defaults in a public or production
deployment.** Before exposing the stack, create a root `.env` and set unique
values for the database password, Neo4j password, and both JWT secrets. For
example:

```powershell
@'
POSTGRES_PASSWORD=replace-with-a-unique-database-password
NEO4J_PASSWORD=replace-with-a-unique-neo4j-password
JWT_ACCESS_SECRET=replace-with-a-random-secret-of-at-least-32-characters
JWT_REFRESH_SECRET=replace-with-a-different-random-secret-of-at-least-32-characters
LLM_API_KEY=
'@ | Set-Content .env
```

Set an LLM provider key if required for the AI features you use. Keep `.env`
private and never bake secrets into an image.

### Docker Hub image guides

- [Frontend image overview](./docs/dockerhub/frontend.md)
- [Backend image overview](./docs/dockerhub/backend.md)
- [AI image overview](./docs/dockerhub/ai.md)

Check logs with `docker compose logs -f frontend backend ai`. If a service
does not become healthy, inspect its logs and confirm that required ports are
available.

## Development

- [Frontend guide](./frontend/README.md)
- [Backend guide](./backend/README.md)
- [AI guide](./ai/README.md)
