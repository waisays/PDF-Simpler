#!/bin/bash

# PDF Simpler Setup Script
# This script helps set up the development environment

set -e  # Exit on error

echo "🚀 Setting up PDF Simpler Development Environment..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Setting up environment variables..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🗄️  Database Setup..."

# Check if MySQL is installed
if command -v mysql &> /dev/null; then
    echo "✅ MySQL is installed"
    echo "💡 To set up the database, run:"
    echo "   mysql -u root -p < database_schema.sql"
else
    echo "⚠️  MySQL is not installed or not in PATH"
    echo "💡 Please install MySQL and run:"
    echo "   mysql -u root -p < database_schema.sql"
fi

echo ""
echo "📁 Creating necessary directories..."

mkdir -p tmp/uploads
mkdir -p tmp/processed
mkdir -p logs

echo "✅ Directories created"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database credentials"
echo "2. Set up MySQL database: mysql -u root -p < database_schema.sql"
echo "3. Start development server: npm run dev"
echo ""
echo "📚 For more information, see README.md and DEVELOPMENT.md"
echo ""
echo "Happy coding! 🚀"