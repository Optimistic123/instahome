# Quick Start Guide

Get the Rental Property Management System running on your local machine in under 5 minutes.

## Prerequisites

Make sure you have these installed:
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **Python** (v3.9+) - [Download](https://www.python.org/)
- **Yarn** - Run `npm install -g yarn`

## Quick Setup

### Option 1: Automated Setup (Recommended)

**On macOS/Linux:**
```bash
./setup_local.sh
```

**On Windows:**
```bash
setup_local.bat
```

### Option 2: Manual Setup

**1. Start MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows - MongoDB runs automatically as a service
```

**2. Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python ../scripts/seed_data.py
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**3. Frontend Setup (new terminal):**
```bash
cd frontend
yarn install
cp .env.example .env
yarn start
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@rental.com | password123 |
| **Agent** | agent1@rental.com | password123 |
| **Owner** | owner1@rental.com | password123 |
| **Tenant** | tenant1@rental.com | password123 |

## Test the Features

### As Admin
1. Login with admin credentials
2. View all properties and visit requests
3. Assign agents to visit requests
4. Mark properties as occupied/available

### As Agent
1. Login with agent credentials
2. View assigned visits
3. Update visit stages (new → talked → scheduled → completed)
4. Add/edit notes with activity tracking

### As Owner
1. Login with owner credentials
2. View all your properties
3. Check rental income and payment status
4. Filter properties by payment status

### As Tenant
1. Login with tenant credentials
2. Browse available properties
3. Request property visits
4. Track your visit requests
5. Archive old requests

## Troubleshooting

**MongoDB not starting?**
```bash
# Check if MongoDB is running
mongosh

# If not, start it manually
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

**Port already in use?**
```bash
# Kill process on port 8001
lsof -ti:8001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Backend not connecting to MongoDB?**
- Check `backend/.env` file exists
- Verify `MONGO_URL=mongodb://localhost:27017`
- Ensure MongoDB is running

**Frontend can't connect to backend?**
- Check `frontend/.env` file exists
- Verify `REACT_APP_BACKEND_URL=http://localhost:8001`
- Make sure backend is running

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Explore the API documentation at http://localhost:8001/docs

## Need Help?

- Check the troubleshooting section in README.md
- Review backend logs in the terminal
- Check browser console for frontend errors
- Create an issue on GitHub
