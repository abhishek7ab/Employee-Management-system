@echo off
setlocal
cd /d "%~dp0"

for /f %%P in ('powershell -NoProfile -Command "$port = 8080; while (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) { $port++ }; $port"') do set "APP_PORT=%%P"

echo Starting Employee Management System with the local H2 database...
echo Open http://localhost:%APP_PORT% after the application starts.
echo.
call mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local" "-Dspring-boot.run.arguments=--server.port=%APP_PORT%"

if errorlevel 1 (
    echo.
    echo The application could not start. Make sure Java 21 is installed.
    pause
)
