# ============================================================
#  CampusBite - Register Daily Git Commit Task
#  Run this script ONCE (as Administrator) to set up the task
#  It will auto-run daily_commit.bat every day at 9:00 PM
# ============================================================

$TaskName  = "CampusBite-DailyGitCommit"
$ScriptPath = 'c:\Users\saisu\project(frontend)\CampusBite\daily_commit.bat'
$RunTime   = "21:00"   # 9:00 PM — change if you prefer another time

Write-Host ""
Write-Host "  Setting up CampusBite Daily Git Commit..." -ForegroundColor Cyan
Write-Host "  Task Name : $TaskName"
Write-Host "  Script    : $ScriptPath"
Write-Host "  Runs At   : $RunTime daily"
Write-Host ""

# Remove old task if it exists
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "  [INFO] Old task removed." -ForegroundColor Yellow
}

# Define action: run daily_commit.bat via cmd
$Action = New-ScheduledTaskAction `
    -Execute "cmd.exe" `
    -Argument "/c `"$ScriptPath`"" `
    -WorkingDirectory 'c:\Users\saisu\project(frontend)\CampusBite'

# Daily trigger at chosen time
$Trigger = New-ScheduledTaskTrigger -Daily -At $RunTime

# Run as current user, whether logged in or not
$Principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Highest

# Task settings
$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -WakeToRun:$false

# Register the task
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Principal $Principal `
    -Settings $Settings `
    -Description "Auto commits CampusBite project changes to Git daily at $RunTime" | Out-Null

Write-Host "  [OK] Task registered successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "  To manage the task later:" -ForegroundColor Gray
Write-Host "  - Open Task Scheduler > Task Scheduler Library"
Write-Host "  - Look for: $TaskName"
Write-Host "  - To remove: Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
Write-Host ""
Write-Host "  To test it right now, run:" -ForegroundColor Gray
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'"
Write-Host ""
