' ============================================================
'  CS&Book launcher
'  Double-click to start the shop (MySQL + web server) and
'  open it in your default browser.
'  Saved as ASCII on purpose: VBScript reads ANSI, not UTF-8.
' ============================================================
Option Explicit

Dim fso, sh, scriptDir, ps1, cmd, i, openFlag

Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
ps1 = scriptDir & "\scripts\start-csbook.ps1"

openFlag = ""
For i = 0 To WScript.Arguments.Count - 1
  If LCase(WScript.Arguments(i)) = "/open" Then openFlag = " -Open"
Next

cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & ps1 & """" & openFlag

' 0 = hidden window, False = do not wait
sh.Run cmd, 0, False
