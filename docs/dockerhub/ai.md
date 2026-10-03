# Sentinel AI Service

Python FastAPI service for evidence processing, including OCR, risk, graph,
search, and model APIs. Capabilities depend on input and providers.

Pull: docker pull malaymaity/sentinel-ai:latest

Run docker compose up -d from the source repository. Inside Compose, the
service listens at http://ai:8000; health check: /health.

Configure provider credentials at runtime; never bake API keys into the image.

Source: https://github.com/malayofficialcse-dev/sentinel
