# หยุดเว็บ CS&Book (และ MySQL) ที่ตัวเรียกอัตโนมัติเปิดไว้
# ใช้เมื่อต้องการปิดทั้งหมด: powershell -ExecutionPolicy Bypass -File scripts\stop-csbook.ps1
param(
  [switch]$KeepMysql
)

$ErrorActionPreference = "SilentlyContinue"

# หยุดเว็บเซิร์ฟเวอร์: หาโปรเซสที่ฟังพอร์ต 3000 อยู่
$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
  $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($procId in $pids) {
    Stop-Process -Id $procId -Force
    Write-Host "หยุดเว็บเซิร์ฟเวอร์ (PID $procId)"
  }
} else {
  Write-Host "เว็บเซิร์ฟเวอร์ไม่ได้เปิดอยู่"
}

if (-not $KeepMysql) {
  $mysql = Get-Process mysqld -ErrorAction SilentlyContinue
  if ($mysql) {
    foreach ($m in $mysql) {
      Stop-Process -Id $m.Id -Force
      Write-Host "หยุด MySQL (PID $($m.Id))"
    }
  } else {
    Write-Host "MySQL ไม่ได้เปิดอยู่"
  }
}

Write-Host "เรียบร้อย"
