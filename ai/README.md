# Sentinel AI Service

Python FastAPI service for evidence processing and investigation support. Its
API includes health checks, evidence analysis, graph and investigation
workflows, semantic search, model endpoints, and an investigator assistant.
OCR and model behavior depends on supported input and provider configuration.

## Run the complete stack

From the repository root, follow the [Docker setup](../README.md#docker).
Compose makes the AI service available to other services at `http://ai:8000`.
Check its health at `/health` and its logs with:

```powershell
docker compose logs -f ai
```

The published production image and pull instructions are documented at
[Sentinel AI on Docker Hub](https://hub.docker.com/r/malaymaity/sentinel-ai).

## Local development

Start the service from this directory with:

```powershell
.\start-dev.ps1
```

or:

```powershell
.\start-dev.cmd
```

Install dependencies before starting the development server:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

The launcher deliberately uses `--reload-dir app`. Do not run bare
`uvicorn app.main:app --reload` from the repository root: Uvicorn may scan
`.venv/Lib/site-packages` while packages are being installed, causing noisy
reloads or `FileNotFoundError` errors for transient `.dist-info` folders.

If the environment was interrupted during installation, repair it with:

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade --force-reinstall platformdirs
.\.venv\Scripts\python.exe -m pip check
```

Set provider keys and service connection details through environment variables
or a local `.env` file. Do not commit credentials or add them to the container
image.
