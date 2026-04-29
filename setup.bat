@echo off
REM PDF Simpler Setup Script for Windows
REM This script helps set up the development environment

echo ========================================
echo PDF Simpler Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm version:
npm --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Setting up environment variables...

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please update .env with your configuration
) else (
    echo ✅ .env file already exists
)

echo.
echo 📁 Creating necessary directories...

if not exist tmp\uploads mkdir tmp\uploads
if not exist tmp\processed mkdir tmp\processed
if not exist logs mkdir logs

echo ✅ Directories created

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update .env with your database credentials
echo 2. Set up MySQL database: mysql -u root -p ^< database_schema.sql
echo 3. Start development server: npm run dev
echo.
echo 📚 For more information, see README.md and DEVELOPMENT.md
echo.
echo Happy coding! 🚀
echo.
pause