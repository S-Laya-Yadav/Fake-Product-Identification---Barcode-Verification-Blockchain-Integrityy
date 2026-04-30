@echo off
echo ==========================================
echo Starting Fake Product Detection System
echo ==========================================

echo [1/2] Setting up Backend...
cd backend
call npm install
start cmd /k "echo Starting Backend Server... && npm start"
cd ..

echo [2/2] Setting up Frontend...
cd frontend
call npm install
start cmd /k "echo Starting Frontend Server... && npm run dev"
cd ..

echo.
echo Both servers have been started in new windows!
echo Make sure MongoDB is running on your machine (mongodb://127.0.0.1:27017).
echo.
pause
