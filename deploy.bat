@echo off
SETLOCAL EnableDelayedExpansion

:: Set Node.js memory limit to 4GB to prevent out-of-memory errors during TypeScript compilation
set "NODE_OPTIONS=--max-old-space-size=4096"

echo ===================================================
echo      VILLEX ONE-CLICK DEPLOYMENT SYSTEM
echo ===================================================
echo.

:: Step 1: Verify Git is installed
echo [1/10] Verifying Git installation...
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    :: Fallback to typical default Windows installation locations
    if exist "C:\Program Files\Git\cmd" (
        set "PATH=%PATH%;C:\Program Files\Git\cmd"
    ) else if exist "C:\Program Files\Git\bin" (
        set "PATH=%PATH%;C:\Program Files\Git\bin"
    ) else if exist "%LOCALAPPDATA%\Programs\Git\bin" (
        set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Git\bin"
    )
)

where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not available in PATH.
    echo Please install Git and try again.
    goto :error_exit
)
echo Git is available.
echo.

:: Step 2: Verify Node.js and npm are available
echo [2/10] Verifying Node.js and npm...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not available in PATH.
    goto :error_exit
)
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed or not available in PATH.
    goto :error_exit
)
echo Node.js and npm are available.
echo.

:: Step 3: Run dependency check
echo [3/10] Running dependency check (npm install)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed.
    goto :error_exit
)
echo.

:: Step 4: Run the project build
echo [4/10] Running project build (npm run build)...
call npm run build -- --concurrency=1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed. Stopping deployment immediately.
    echo [ERROR] Broken code will NOT be committed or pushed.
    goto :error_exit
)
echo.

:: Step 5: Run git add .
echo [5/10] Staging changes (git add .)...
git add .
if %ERRORLEVEL% neq 0 (
    echo [ERROR] git add failed.
    goto :error_exit
)
echo.

:: Step 6: Ask the developer for a commit message
echo [6/10] Configuring commit message...
set "commit_msg="
set /p "commit_msg=Enter commit message (Press Enter for default 'Update project'): "

if "!commit_msg!"=="" (
    set "commit_msg=Update project"
)
echo.

:: Step 7: Run git commit
echo [7/10] Committing changes...
git commit -m "!commit_msg!"
if %ERRORLEVEL% neq 0 (
    echo [WARNING] git commit did not create a new commit (possibly no changes to commit).
)
echo.

:: Step 8: Run git push origin main
echo [8/10] Pushing to GitHub (git push origin main)...
git push origin main
if %ERRORLEVEL% neq 0 (
    echo [ERROR] git push failed.
    goto :error_exit
)
echo.

:: Step 9: Display push success
echo [9/10] Status Check...
echo ✓ GitHub Push Successful
echo.

:: Step 10: Display Vercel deploy hook notice
echo [10/10] Vercel Trigger Check...
echo Vercel deployment has started automatically.
echo.

echo ===================================================
echo  ✓ Deployment Workflow Completed Successfully!
echo ===================================================
echo.

:: Check if the script was run by double-clicking (explorer wraps batch invocation in nested quotes)
echo %cmdcmdline% | findstr /i /c:"\"\"" >nul
if %ERRORLEVEL% equ 0 (
    echo Press any key to close this window...
    pause >nul
)
exit /b 0

:error_exit
echo.
echo ===================================================
echo  [FAILED] Deployment stopped due to an error.
echo ===================================================
echo.
echo %cmdcmdline% | findstr /i /c:"\"\"" >nul
if %ERRORLEVEL% equ 0 (
    echo Press any key to close this window...
    pause >nul
)
exit /b 1
