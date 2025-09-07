$ErrorActionPreference = 'Stop'

function Stop-Port($port) {
  try {
    $p = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($p) {
      Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue
      Write-Host "Stopped process on port $port (PID $($p.OwningProcess))"
    }
  } catch {}
}

try {
  Write-Host "Stopping :3001 if running..."
  Stop-Port 3001

  $root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
  Set-Location $root

  if (Test-Path '.next') { Remove-Item '.next' -Recurse -Force }
  if (!(Test-Path 'prisma\db')) { New-Item -ItemType Directory 'prisma\db' | Out-Null }

  Write-Host "Starting dev server..."
  Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory $root -WindowStyle Normal
  Write-Host "Server starting on http://localhost:3001"
} catch {
  Write-Error $_
  exit 1
}
