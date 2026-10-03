# Sentinel Frontend

This directory contains Sentinel's React, TypeScript, and Vite web application.
The frontend provides reporter, investigator, and administrator workspaces for
case management, evidence review, risk analysis, and investigation reporting.

## Local development

From this directory:

```powershell
npm.cmd install
npm.cmd run dev
```

The Vite development server proxies `/api` requests to
`http://localhost:4000`. Start the backend separately, or use the root Docker
Compose stack for the complete application.

## Build and checks

```powershell
npm.cmd run build
npm.cmd run lint
```

The production container builds the static application and serves it through
Nginx. For deployment, use the root `compose.yaml`, which routes frontend API
requests to the backend service.
