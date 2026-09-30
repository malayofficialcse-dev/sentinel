# Sentinel AI service

## Development server

Start the service from this directory with:

```powershell
.\start-dev.ps1
```

or:

```powershell
.\start-dev.cmd
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
