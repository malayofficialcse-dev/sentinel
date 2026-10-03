# sentinel
fraud detection system

## Docker

The root Compose file builds and runs the frontend, backend, and AI service,
along with PostgreSQL, Redis, and Neo4j:

```powershell
docker compose build frontend backend ai
docker compose up -d
```

Open the frontend at <http://localhost:8080>. For production, set
`POSTGRES_PASSWORD`, `NEO4J_PASSWORD`, `JWT_ACCESS_SECRET`, and
`JWT_REFRESH_SECRET` in a root `.env` file before starting the stack. Use
non-default random values for all secrets.

To publish only the three application images to Docker Hub:

```powershell
docker login -u malaymaity
docker compose build frontend backend ai
docker compose push frontend backend ai
```
