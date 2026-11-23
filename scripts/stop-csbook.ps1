# หยุดเว็บ CS&Book (และ MySQL) ที่ตัวเรียกอัตโนมัติเปิดไว้
# ใช้เมื่อต้องการปิดทั้งหมด: powershell -ExecutionPolicy Bypass -File scripts\stop-csbook.ps1
param(
  [switch]$KeepMysql
)

$ErrorActionPreference = "SilentlyContinue"

# หยุดเว็บเซิร์ฟเวอร์ที่ฟังพอร์ต 80 หรือ 3000
$stopped = $false
foreach ($port in @(80, 3000)) {
  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if ($conn) {
    $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $pids) {
      Stop-Process -Id $procId -Force
      Write-Host "หยุดเว็บเซิร์ฟเวอร์ (PID $procId, พอร์ต $port)"
      $stopped = $true
    }
  }
}
if (-not $stopped) { Write-Host "เว็บเซิร์ฟเวอร์ไม่ได้เปิดอยู่" }

if (-not $KeepMysql) {
  $mysql = Get-Process mysqld -ErrorAction SilentlyContinue
  if ($mysql) {
    # ปิด MySQL แบบ graceful (สำคัญ! การ force-kill ทำให้ system table เสีย)
    $mysqlAdmin = "C:\xampp\mysql\bin\mysqladmin.exe"
    if (Test-Path $mysqlAdmin) {
      & $mysqlAdmin --user=root shutdown 2>$null
      for ($i = 0; $i -lt 15; $i++) {
        if (-not (Get-Process mysqld -ErrorAction SilentlyContinue)) { break }
        Start-Sleep -Seconds 1
      }
    }
    $still = Get-Process mysqld -ErrorAction SilentlyContinue
    if ($still) {
      Write-Host "MySQL ไม่ยอมปิดตามปกติ — กำลังบังคับปิด (ควรเลี่ยง)"
      $still | ForEach-Object { Stop-Process -Id $_.Id -Force }
    } else {
      Write-Host "หยุด MySQL เรียบร้อย (graceful shutdown)"
    }
  } else {
    Write-Host "MySQL ไม่ได้เปิดอยู่"
  }
}

Write-Host "เรียบร้อย"
