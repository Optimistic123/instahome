# Rental Property Management System

A full-stack rental property management platform where the platform acts as a Proxy Owner, managing properties on behalf of real property owners while enabling users (tenants) to discover properties and request visits.

## Features

### User Roles
- **Admin**: Manage properties, visit requests, and agents
- **Agent**: Handle assigned visit requests and update visit stages
- **Owner**: View property earnings and rental income (read-only)
- **Tenant**: Browse properties and request visits

### Key Functionalities
- Multi-role authentication (JWT + Google OAuth)
- Property listing and management with images
- Visit request workflow with activity tracking
- Agent assignment and visit stage management
- Property occupancy status tracking
- Owner financial dashboard with rental income tracking
- Real-time search and filtering

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI (Python), Motor (async MongoDB driver)
- **Database**: MongoDB
- **Authentication**: JWT + Emergent Google OAuth

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Yarn** - Install via `npm install -g yarn`

## Local Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd rental-property-management
```

### 2. MongoDB Setup

#### Option A: Local MongoDB Installation

1. Install MongoDB Community Edition for your OS
2. Start MongoDB service:
   ```bash
   # On macOS (with Homebrew)
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   
   # On Windows
   # MongoDB runs as a service automatically after installation
   ```

3. Verify MongoDB is running:
   ```bash
   mongosh
   # You should see the MongoDB shell
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Whitelist your IP address in Atlas

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=rental_management
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=your-secret-key-change-this-in-production
EOF

# Note: If using MongoDB Atlas, replace MONGO_URL with your Atlas connection string
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/

# Seed the database with sample data
python ../scripts/seed_data.py

# Run the backend server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Backend will be available at: `http://localhost:8001`
API docs at: `http://localhost:8001/docs`

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
yarn install

# Create .env file
cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
EOF

# Start the development server
yarn start
```

Frontend will be available at: `http://localhost:3000`

### 5. Access the Application

Open your browser and navigate to: `http://localhost:3000`

## Demo Credentials

After running the seed script, use these credentials to test different roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rental.com | password123 |
| Agent | agent1@rental.com | password123 |
| Owner | owner1@rental.com | password123 |
| Tenant | tenant1@rental.com | password123 |

## Project Structure

```
rental-property-management/
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── pages/         # Page components
│   │   └── components/    # Reusable components
│   ├── package.json       # Node dependencies
│   └── .env              # Frontend environment variables
├── scripts/
│   └── seed_data.py       # Database seeding script
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/session` - Create session from OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Properties
- `GET /api/properties` - List all properties (with filters)
- `GET /api/properties/{id}` - Get property details
- `POST /api/properties` - Create property (Admin only)
- `PUT /api/properties/{id}` - Update property (Admin only)
- `PATCH /api/properties/{id}/status` - Update property status

### Visit Requests
- `POST /api/visit-requests` - Create visit request
- `GET /api/visit-requests` - List visit requests (filtered by role)
- `PATCH /api/visit-requests/{id}` - Update visit request

### Admin
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create agent

### Owner
- `GET /api/owner/dashboard` - Get owner dashboard data

## Development Tips

### Hot Reload
- Backend has auto-reload enabled with `--reload` flag
- Frontend has hot module replacement (HMR) by default

### Database Management

```bash
# Access MongoDB shell
mongosh

# Switch to your database
use rental_management

# View collections
show collections

# Query data
db.users.find().pretty()
db.properties.find().pretty()
db.visit_requests.find().pretty()

# Clear all data
db.dropDatabase()
```

### Adding New Dependencies

Backend:
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
pip install <package-name>
pip freeze > requirements.txt
```

Frontend:
```bash
cd frontend
yarn add <package-name>
```

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh`
- Check MongoDB logs: `tail -f /usr/local/var/log/mongodb/mongo.log` (macOS)
- Ensure correct connection string in `.env`

### Port Already in Use
```bash
# Backend (port 8001)
lsof -ti:8001 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### CORS Issues
- Ensure `CORS_ORIGINS` in backend `.env` includes `http://localhost:3000`
- Clear browser cache and cookies

### Module Import Errors
```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules
yarn install
```

## Production Deployment

### Backend
1. Set environment variables for production
2. Use production MongoDB instance
3. Update `JWT_SECRET` with a secure random string
4. Deploy to platforms like:
   - Heroku
   - AWS Elastic Beanstalk
   - Google Cloud Run
   - DigitalOcean App Platform

### Frontend
1. Update `REACT_APP_BACKEND_URL` to production API URL
2. Build for production: `yarn build`
3. Deploy to platforms like:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

## Environment Variables Reference

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=rental_management
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=your-secret-key-change-this-in-production
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
