@echo off
echo ================================================
echo Rental Property Management - Local Setup
echo ================================================
echo.

REM Check if MongoDB is installed
echo Checking MongoDB installation...
where mongosh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X MongoDB is not installed!
    echo Please install MongoDB from: https://www.mongodb.com/try/download/community
    echo Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas
    exit /b 1
) else (
    echo OK MongoDB is installed
)

REM Check if Node.js is installed
echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo OK Node.js is installed ^(%NODE_VERSION%^)
)

REM Check if Python is installed
echo Checking Python installation...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Python is not installed!
    echo Please install Python from: https://www.python.org/
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo OK Python is installed ^(%PYTHON_VERSION%^)
)

REM Check if Yarn is installed
echo Checking Yarn installation...
where yarn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ! Yarn is not installed. Installing...
    npm install -g yarn
) else (
    for /f "tokens=*" %%i in ('yarn --version') do set YARN_VERSION=%%i
    echo OK Yarn is installed ^(%YARN_VERSION%^)
)

echo.
echo ================================================
echo Setting up Backend
echo ================================================
echo.

cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install backend dependencies
echo Installing backend dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating backend .env file...
    copy .env.example .env
    echo ! Please update backend\.env with your MongoDB connection string if needed
)

echo.
echo ================================================
echo Setting up Frontend
echo ================================================
echo.

cd ..\frontend

REM Install frontend dependencies
echo Installing frontend dependencies...
call yarn install

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating frontend .env file...
    copy .env.example .env
)

cd ..

echo.
echo ================================================
echo Seeding Database
echo ================================================
echo.

REM Seed the database
echo Seeding database with sample data...
cd backend
call venv\Scripts\activate.bat
python ..\scripts\seed_data.py
cd ..

echo.
echo ================================================
echo Setup Complete! 🎉
echo ================================================
echo.
echo To start the application:
echo.
echo 1. Start Backend ^(in one terminal^):
echo    cd backend
echo    venv\Scripts\activate.bat
echo    uvicorn server:app --host 0.0.0.0 --port 8001 --reload
echo.
echo 2. Start Frontend ^(in another terminal^):
echo    cd frontend
echo    yarn start
echo.
echo 3. Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8001
echo    API Docs: http://localhost:8001/docs
echo.
echo Demo Credentials:
echo    Admin: admin@rental.com / password123
echo    Agent: agent1@rental.com / password123
echo    Owner: owner1@rental.com / password123
echo    Tenant: tenant1@rental.com / password123
echo.

pause
