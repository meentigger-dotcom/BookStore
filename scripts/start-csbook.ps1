# สตาร์ทเว็บ CS&Book แบบพร้อมใช้ (ไม่ต้องเปิด XAMPP / ไม่ต้อง npm run dev)
# เปิดที่ http://www.csbook.com (พอร์ต 80) — ถ้าพอร์ต 80 ถูกใช้ จะถอยไปใช้ :3000 ให้อัตโนมัติ
# วิธีใช้: ดับเบิลคลิก CSBook.vbs  หรือรันไฟล์นี้ตรงๆ
#   powershell -ExecutionPolicy Bypass -File scripts\start-csbook.ps1 -Open
param(
  [switch]$Open,
  [switch]$Quiet
)

$ErrorActionPreference = "SilentlyContinue"

$ProjectDir   = Split-Path -Parent $PSScriptRoot
$MysqlExe     = "C:\xampp\mysql\bin\mysqld.exe"
$MysqlIni     = "C:\xampp\mysql\bin\my.ini"
$LogDir       = Join-Path $ProjectDir "logs"
$Domain       = "www.csbook.com"
$PreferredPort = 80
$FallbackPort  = 3000

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

# ตรวจว่าเป็นเว็บ CS&Book ของเราจริง (ไม่ใช่แอปอื่นที่จับพอร์ตอยู่)
function Test-CsbookServer {
  param([int]$Port)
  try {
    $res = Invoke-WebRequest -Uri "http://127.0.0.1:$Port" -UseBasicParsing -TimeoutSec 4 `
      -Headers @{ Host = $Domain }
    return ($res.StatusCode -eq 200 -and $res.Content -match "CS&Book")
  } catch {
    return $false
  }
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

# ---------- 2) เลือกพอร์ต (80 ก่อน, ถ้าไม่ได้ใช้ 3000) ----------
$ServerPort = $PreferredPort
if (-not (Test-CsbookServer $PreferredPort)) {
  if (Test-Port "127.0.0.1" $PreferredPort 400) {
    # มีโปรแกรมอื่นจับพอร์ต 80 อยู่ — ถ้าเป็น Apache ของ XAMPP ให้หยุดเพื่อคืนพอร์ต
    $owners = Get-NetTCPConnection -LocalPort $PreferredPort -State Listen -ErrorAction SilentlyContinue |
      Select-Object -ExpandProperty OwningProcess -Unique
    $freed = $false
    foreach ($procId in $owners) {
      $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$procId" -ErrorAction SilentlyContinue
      if ($proc -and $proc.Name -eq "httpd.exe" -and $proc.ExecutablePath -like "*\xampp\apache\*") {
        Stop-Process -Id $procId -Force
        $freed = $true
      }
    }
    if ($freed) {
      for ($i = 0; $i -lt 15; $i++) {
        if (-not (Test-Port "127.0.0.1" $PreferredPort 400)) { break }
        Start-Sleep -Seconds 1
      }
    }
    if (Test-Port "127.0.0.1" $PreferredPort 400) {
      # ยังถูกแอปอื่นใช้อยู่ → ถอยไปพอร์ต 3000
      $ServerPort = $FallbackPort
    }
  }
}

# ---------- 3) เว็บเซิร์ฟเวอร์ (production) ----------
if (-not (Test-CsbookServer $ServerPort)) {
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

  Wait-Port "127.0.0.1" $ServerPort 60 | Out-Null
}

if (-not (Test-CsbookServer $ServerPort)) {
  if (-not $Quiet) {
    Show-Error ("เว็บเซิร์ฟเวอร์ไม่ตอบสนอง`n`nดู log ได้ที่:`n" + (Join-Path $LogDir "server.err.log"))
  }
  exit 1
}

# ---------- 4) เปิดเบราว์เซอร์ ----------
$url = if ($ServerPort -eq 80) { "http://$Domain" } else { "http://$Domain`:$ServerPort" }
if ($Open) {
  Start-Process $url
}
