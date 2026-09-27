@echo off
set "PATH=C:\Users\indir\tools\nodejs;%PATH%"
echo Starting KalaSetu / Karigar AI...
start "KalaSetu Backend" cmd /k "cd /d ""%~dp0apps\api"" && npm run dev"
timeout /t 3 /nobreak >nul
start "KalaSetu Frontend" cmd /k "cd /d ""%~dp0apps\mobile"" && npm run web"
echo.
echo ==============================================
echo App is launching:
echo - Frontend UI:  http://localhost:8081
echo - Backend API:  http://localhost:4000
echo ==============================================
pause
