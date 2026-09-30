$ErrorActionPreference = "Stop"

# Run from the AI service directory so Uvicorn imports app.main correctly.
Set-Location $PSScriptRoot

$python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path -LiteralPath $python)) {
    $python = Join-Path $PSScriptRoot "venv\Scripts\python.exe"
}
if (-not (Test-Path -LiteralPath $python)) {
    throw "No Python virtual environment found. Create ai\.venv or ai\venv first."
}

# Limit StatReload to application code. Without --reload-dir, Uvicorn scans
# site-packages and can restart/crash while pip is installing packages.
& $python -m uvicorn app.main:app `
    --host 0.0.0.0 `
    --port 8000 `
    --reload `
    --reload-dir app
