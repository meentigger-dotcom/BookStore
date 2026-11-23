# สตาร์ทเว็บ CS&Book แบบพร้อมใช้ (ไม่ต้องเปิด XAMPP / ไม่ต้อง npm run dev)
# วิธีใช้: ดับเบิลคลิก CSBook.vbs  หรือรันไฟล์นี้ตรงๆ
#   powershell -ExecutionPolicy Bypass -File scripts\start-csbook.ps1 -Open
param(
  [switch]$Open,
  [switch]$Quiet
)

$ErrorActionPreference = "SilentlyContinue"

$ProjectDir = Split-Path -Parent $PSScriptRoot
$MysqlExe   = "C:\xampp\mysql\bin\mysqld.exe"
$MysqlIni   = "C:\xampp\mysql\bin\my.ini"
$LogDir     = Join-Path $ProjectDir "logs"
$ServerPort = 3000

function Test-Port {
  param([string]$TargetHost, [int]$Port, [int]$TimeoutMs = 600)
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $iar = $client.BeginConnect($TargetHost, $Port, $null, $null)
    if (-not $iar.AsyncWaitHandle.WaitOne($TimeoutMs)) { return $false }
    $client.EndConnect($iar)
    return $true
  } catch {
    return $false
  } finally {
    try { $client.Close() } catch { }
  }
}

function Wait-Port {
  param([string]$TargetHost, [int]$Port, [int]$Seconds)
  for ($i = 0; $i -lt $Seconds; $i++) {
    if (Test-Port $TargetHost $Port 700) { return $true }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Show-Error([string]$Message) {
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show(
      $Message, "CS&Book", "OK", "Error"
    ) | Out-Null
  } catch { }
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# ---------- 1) ฐานข้อมูล MySQL ----------
$mysqlReady = Test-Port "127.0.0.1" 3306 500
if (-not $mysqlReady) {
  if (Test-Path $MysqlExe) {
    Start-Process -FilePath $MysqlExe `
      -ArgumentList @("--defaults-file=$MysqlIni", "--standalone") `
      -WindowStyle Hidden
    $mysqlReady = Wait-Port "127.0.0.1" 3306 45
  }
}

if (-not $mysqlReady) {
  if (-not $Quiet) {
    Show-Error ("สตาร์ท MySQL ไม่สำเร็จ`n`nตรวจสอบว่าโฟลเดอร์ C:\xampp\mysql ยังอยู่ครบ`nหรือเปิด XAMPP แล้วกด Start MySQL หนึ่งครั้ง")
  }
  exit 1
}

# ---------- 2) เว็บเซิร์ฟเวอร์ (production) ----------
$serverReady = Test-Port "127.0.0.1" $ServerPort 500
if (-not $serverReady) {
  # หา node.exe
  $node = "C:\Program Files\nodejs\node.exe"
  if (-not (Test-Path $node)) {
    $cmd = Get-Command node -ErrorAction SilentlyContinue
    if ($cmd) { $node = $cmd.Source }
  }
  if (-not $node) {
    if (-not $Quiet) { Show-Error "ไม่พบ Node.js ในเครื่อง กรุณาติดตั้ง Node.js ก่อน" }
    exit 1
  }

  $nextBin = Join-Path $ProjectDir "node_modules\next\dist\bin\next"
  if (-not (Test-Path $nextBin)) {
    if (-not $Quiet) { Show-Error "ยังไม่ได้ติดตั้ง dependencies`nกรุณารัน npm install ใน C:\BookStore\bookstore หนึ่งครั้ง" }
    exit 1
  }

  if (-not (Test-Path (Join-Path $ProjectDir ".next\BUILD_ID"))) {
    if (-not $Quiet) { Show-Error "ยังไม่มีไฟล์ build`nกรุณารัน npm run build ใน C:\BookStore\bookstore หนึ่งครั้ง" }
    exit 1
  }

  Start-Process -FilePath $node `
    -ArgumentList @("node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "$ServerPort") `
    -WorkingDirectory $ProjectDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $LogDir "server.out.log") `
    -RedirectStandardError  (Join-Path $LogDir "server.err.log")

  $serverReady = Wait-Port "127.0.0.1" $ServerPort 60
}

if (-not $serverReady) {
  if (-not $Quiet) {
    Show-Error ("เว็บเซิร์ฟเวอร์ไม่ตอบสนอง`n`nดู log ได้ที่:`n" + (Join-Path $LogDir "server.err.log"))
  }
  exit 1
}

# ---------- 3) รอให้หน้าเว็บตอบ HTTP 200 จริง ----------
for ($i = 0; $i -lt 30; $i++) {
  try {
    $res = Invoke-WebRequest -Uri "http://127.0.0.1:$ServerPort" -UseBasicParsing -TimeoutSec 3
    if ($res.StatusCode -eq 200) { break }
  } catch { }
  Start-Sleep -Seconds 1
}

# ---------- 4) เปิดเบราว์เซอร์ ----------
if ($Open) {
  Start-Process "http://localhost:$ServerPort"
}
