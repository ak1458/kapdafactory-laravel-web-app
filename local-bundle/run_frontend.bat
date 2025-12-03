@echo off
echo Starting Frontend Server...
cd frontend
if not exist "node_modules" (
    echo Installing Frontend Dependencies...
    call npm install
)
start "" http://localhost:5173
call npm run dev
