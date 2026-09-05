@echo off
setlocal
cd /d "%~dp0"

echo Starting Employee Management System with the local H2 database...
echo Open http://localhost:8080 after the application starts.
echo.
call mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"

if errorlevel 1 (
    echo.
    echo The application could not start. Make sure Java 21 is installed.
    pause
)
