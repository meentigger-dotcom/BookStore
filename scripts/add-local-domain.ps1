# Add local domain entries for CS&Book (run as Administrator)
$ErrorActionPreference = "Stop"
$hostsPath = Join-Path $env:SystemRoot "System32\drivers\etc\hosts"
$entries = @(
  "127.0.0.1 www.csbook.com",
  "127.0.0.1 csbook.com"
)

$content = Get-Content -LiteralPath $hostsPath -Raw -ErrorAction SilentlyContinue
if (-not $content) { $content = "" }

$added = @()
foreach ($entry in $entries) {
  $hostName = ($entry -split "\s+")[1]
  if ($content -notmatch [regex]::Escape($hostName)) {
    Add-Content -LiteralPath $hostsPath -Value $entry -Encoding ASCII
    $added += $entry
  }
}

ipconfig /flushdns | Out-Null

if ($added.Count -gt 0) {
  Write-Host "ADDED:"
  $added | ForEach-Object { Write-Host "  $_" }
} else {
  Write-Host "ALREADY PRESENT"
}
