@echo off
echo Starting DMS Servers...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak >nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo.
echo Servers are starting...
echo Backend: http://localhost:8081
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul


