@echo off
echo ==============================================================
echo Starting AI Lecture Notes Generator (Backend + Frontend)
echo ==============================================================

echo [1/2] Starting Spring Boot Backend on http://localhost:8080...
start "AI Lecture Notes - Backend" cmd /k "cd backend && java -jar target\ai-lecture-notes-generator-1.0.0.jar"

timeout /t 5 /nobreak >nul

echo [2/2] Starting React Vite Frontend on http://localhost:5173...
start "AI Lecture Notes - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8080/api/health
echo.
pause
