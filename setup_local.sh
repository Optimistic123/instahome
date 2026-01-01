#!/bin/bash

echo "================================================"
echo "Rental Property Management - Local Setup"
echo "================================================"
echo ""

# Check if MongoDB is installed
echo "Checking MongoDB installation..."
if ! command -v mongosh &> /dev/null
then
    echo "❌ MongoDB is not installed!"
    echo "Please install MongoDB from: https://www.mongodb.com/try/download/community"
    echo "Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas"
    exit 1
else
    echo "✅ MongoDB is installed"
fi

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
else
    echo "✅ Node.js is installed ($(node --version))"
fi

# Check if Python is installed
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null
then
    echo "❌ Python 3 is not installed!"
    echo "Please install Python from: https://www.python.org/"
    exit 1
else
    echo "✅ Python is installed ($(python3 --version))"
fi

# Check if Yarn is installed
echo "Checking Yarn installation..."
if ! command -v yarn &> /dev/null
then
    echo "⚠️  Yarn is not installed. Installing..."
    npm install -g yarn
else
    echo "✅ Yarn is installed ($(yarn --version))"
fi

echo ""
echo "================================================"
echo "Setting up Backend"
echo "================================================"
echo ""

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your MongoDB connection string if needed"
fi

echo ""
echo "================================================"
echo "Setting up Frontend"
echo "================================================"
echo ""

cd ../frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
yarn install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
fi

cd ..

echo ""
echo "================================================"
echo "Seeding Database"
echo "================================================"
echo ""

# Seed the database
echo "Seeding database with sample data..."
cd backend
source venv/bin/activate
python ../scripts/seed_data.py
cd ..

echo ""
echo "================================================"
echo "Setup Complete! 🎉"
echo "================================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (in one terminal):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo ""
echo "2. Start Frontend (in another terminal):"
echo "   cd frontend"
echo "   yarn start"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8001"
echo "   API Docs: http://localhost:8001/docs"
echo ""
echo "Demo Credentials:"
echo "   Admin: admin@rental.com / password123"
echo "   Agent: agent1@rental.com / password123"
echo "   Owner: owner1@rental.com / password123"
echo "   Tenant: tenant1@rental.com / password123"
echo ""
