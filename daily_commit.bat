@echo off
:: ============================================================
::  CampusBite - Daily Auto Git Commit Script
::  Runs via Windows Task Scheduler every day
::  Commits all changes with a timestamp message
:: ============================================================

setlocal EnableDelayedExpansion

:: Project path
set "REPO=c:\Users\saisu\project(frontend)\CampusBite"

:: Log file
set "LOGFILE=%REPO%\git_daily_log.txt"

:: Get date and time
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "dt=%%I"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "MIN=%dt:~10,2%"

set "TIMESTAMP=%YYYY%-%MM%-%DD% %HH%:%MIN%"
set "COMMIT_MSG=chore: daily update - %YYYY%-%MM%-%DD%"

echo. >> "%LOGFILE%"
echo ============================================ >> "%LOGFILE%"
echo  Daily Commit - %TIMESTAMP% >> "%LOGFILE%"
echo ============================================ >> "%LOGFILE%"

:: Navigate to repo
cd /d "%REPO%"
if errorlevel 1 (
    echo [ERROR] Cannot find repo at %REPO% >> "%LOGFILE%"
    exit /b 1
)

:: Check if there are any changes to commit
git status --porcelain > "%TEMP%\git_status_check.txt"
for %%A in ("%TEMP%\git_status_check.txt") do set "FILESIZE=%%~zA"

if %FILESIZE% EQU 0 (
    echo [INFO] No changes to commit today. Repo is clean. >> "%LOGFILE%"
    echo [INFO] No changes to commit - %TIMESTAMP%
    exit /b 0
)

:: Stage all changes
git add -A >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo [ERROR] git add failed >> "%LOGFILE%"
    exit /b 1
)
echo [OK] Staged all changes >> "%LOGFILE%"

:: Commit with timestamp
git commit -m "%COMMIT_MSG%" >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo [ERROR] git commit failed >> "%LOGFILE%"
    exit /b 1
)
echo [OK] Committed: %COMMIT_MSG% >> "%LOGFILE%"

:: Push to remote (optional - comment out if you don't want auto-push)
git push origin main >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    git push origin master >> "%LOGFILE%" 2>&1
    if errorlevel 1 (
        echo [WARN] Push failed - commit saved locally >> "%LOGFILE%"
    ) else (
        echo [OK] Pushed to remote (master) >> "%LOGFILE%"
    )
) else (
    echo [OK] Pushed to remote (main) >> "%LOGFILE%"
)

echo [DONE] Daily commit complete - %TIMESTAMP% >> "%LOGFILE%"
echo [DONE] CampusBite daily commit done!
