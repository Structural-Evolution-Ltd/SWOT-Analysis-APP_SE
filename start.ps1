# Start SWOT Analysis App (backend + frontend)
# Run from the project root: .\start.ps1

$root = $PSScriptRoot
$uv = "$env:USERPROFILE\.local\bin\uv.exe"

# Clear stale processes on app ports before starting (skip any process owned by VS Code / Code.exe)
Write-Host "Clearing stale processes..." -ForegroundColor Gray
$stalePids = (Get-NetTCPConnection -LocalPort 5173,5174,8000 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique
if ($stalePids) {
    foreach ($pid in $stalePids) {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc -and $proc.Name -notmatch 'Code|WindowsTerminal') {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Starting backend..." -ForegroundColor Cyan
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$root\src\backend'; & '$uv' run uvicorn app.main:app --host 0.0.0.0 --port 8000" `
    -PassThru

Write-Host "Starting frontend..." -ForegroundColor Cyan
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$root\src\frontend'; npm run dev" `
    -PassThru

Write-Host ""
Write-Host "Both servers are starting up." -ForegroundColor Green
Write-Host "  Open in browser: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Close the two new PowerShell windows to stop the app." -ForegroundColor Gray
