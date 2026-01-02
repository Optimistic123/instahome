# Deployment Guide

This guide covers deploying the Rental Property Management System to various platforms.

## Table of Contents
- [Environment Configuration](#environment-configuration)
- [MongoDB Setup](#mongodb-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Common Issues](#common-issues)

## Environment Configuration

### Production Environment Variables

#### Backend (.env)
```bash
# MongoDB - Use MongoDB Atlas or your production MongoDB instance
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/

# Database name
DB_NAME=rental_management_prod

# CORS - Add your frontend production URL
CORS_ORIGINS=https://your-frontend-domain.com

# JWT Secret - Generate a secure random string
JWT_SECRET=generate-a-long-random-secure-string-for-production
```

**Generate a secure JWT secret:**
```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Using OpenSSL
openssl rand -base64 32
```

#### Frontend (.env)
```bash
# Backend API URL - Your production backend URL
REACT_APP_BACKEND_URL=https://your-api-domain.com
```

## MongoDB Setup

### MongoDB Atlas (Recommended for Production)

1. **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster**:
   - Choose a cloud provider (AWS, GCP, Azure)
   - Select a region close to your users
   - Choose M0 (Free tier) for testing or M10+ for production

3. **Database Access**:
   - Create a database user
   - Note the username and password

4. **Network Access**:
   - Add IP addresses that can connect
   - For testing: Allow access from anywhere (0.0.0.0/0)
   - For production: Whitelist specific IPs

5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

### Self-Hosted MongoDB

For self-hosted MongoDB:
```bash
# Ensure MongoDB is configured for remote access
# Edit /etc/mongod.conf:
net:
  bindIp: 0.0.0.0  # Allow connections from any IP

# Enable authentication
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod

# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["root"]
})

# Connection string format:
# mongodb://admin:secure_password@your-server-ip:27017/rental_management_prod?authSource=admin
```

## Backend Deployment

### Option 1: Railway (Recommended)

Railway is the easiest and most modern platform for deploying FastAPI applications. It offers automatic HTTPS, easy environment variable management, and a generous free tier.

**Quick Setup:**

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `instahome/backend` directory as root

3. **Set Environment Variables** (in Railway Dashboard → Variables):
   ```
   MONGO_URL=your-mongodb-connection-string
   DB_NAME=rental_management_prod
   JWT_SECRET=your-secure-jwt-secret-here
   CORS_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
   ```

4. **Deploy**: Railway automatically detects Python/FastAPI and deploys

5. **Get Your URL**: Railway provides a URL like `https://your-app.up.railway.app`

**Using Railway CLI:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize (in backend directory)
cd backend
railway init

# Set environment variables
railway variables set MONGO_URL="your-mongodb-url"
railway variables set DB_NAME="rental_management_prod"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set CORS_ORIGINS="https://your-frontend-domain.com"

# Deploy
railway up

# View logs
railway logs
```

**Features:**
- ✅ Automatic HTTPS/SSL
- ✅ Free tier ($5 credit/month)
- ✅ Auto-deploy from GitHub
- ✅ Built-in MongoDB plugin option
- ✅ Custom domains support
- ✅ Easy environment variable management

For detailed Railway deployment guide, see [backend/RAILWAY_DEPLOYMENT.md](backend/RAILWAY_DEPLOYMENT.md)

### Option 2: Heroku

1. **Install Heroku CLI**:
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Other platforms: https://devcenter.heroku.com/articles/heroku-cli
```

2. **Login and Create App**:
```bash
heroku login
heroku create your-app-name
```

3. **Set Environment Variables**:
```bash
heroku config:set MONGO_URL="your-mongodb-url"
heroku config:set DB_NAME="rental_management_prod"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set CORS_ORIGINS="https://your-frontend-domain.com"
```

4. **Create Procfile** (in backend directory):
```
web: uvicorn server:app --host 0.0.0.0 --port $PORT
```

5. **Deploy**:
```bash
cd backend
git init
heroku git:remote -a your-app-name
git add .
git commit -m "Initial deployment"
git push heroku master
```

### Option 2: DigitalOcean App Platform

1. **Create Account**: [DigitalOcean](https://www.digitalocean.com/)

2. **Create New App**:
   - Connect your GitHub/GitLab repository
   - Select the backend directory
   - Choose Python as the build pack

3. **Configure**:
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `uvicorn server:app --host 0.0.0.0 --port 8080`
   - Add environment variables in the dashboard

4. **Deploy**: App will auto-deploy on git push

### Option 3: AWS Elastic Beanstalk

1. **Install EB CLI**:
```bash
pip install awsebcli
```

2. **Initialize**:
```bash
cd backend
eb init -p python-3.9 rental-backend
```

3. **Create Environment**:
```bash
eb create rental-backend-env
```

4. **Configure Environment Variables**:
```bash
eb setenv MONGO_URL="your-url" DB_NAME="rental_management_prod" JWT_SECRET="your-secret" CORS_ORIGINS="your-frontend-url"
```

5. **Deploy**:
```bash
eb deploy
```

### Option 4: Docker Deployment

**Dockerfile** (create in backend directory):
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Build and Run**:
```bash
docker build -t rental-backend .
docker run -p 8001:8001 \
  -e MONGO_URL="your-url" \
  -e DB_NAME="rental_management_prod" \
  -e JWT_SECRET="your-secret" \
  -e CORS_ORIGINS="your-frontend-url" \
  rental-backend
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
cd frontend
vercel
```

3. **Set Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add `REACT_APP_BACKEND_URL` with your backend URL

4. **Production Deployment**:
```bash
vercel --prod
```

### Option 2: Netlify

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build**:
```bash
cd frontend
yarn build
```

3. **Deploy**:
```bash
netlify deploy --prod
```

4. **Environment Variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add `REACT_APP_BACKEND_URL`

### Option 3: AWS S3 + CloudFront

1. **Build**:
```bash
cd frontend
REACT_APP_BACKEND_URL=https://your-api-domain.com yarn build
```

2. **Create S3 Bucket**:
```bash
aws s3 mb s3://your-bucket-name
aws s3 website s3://your-bucket-name --index-document index.html
```

3. **Upload Build**:
```bash
aws s3 sync build/ s3://your-bucket-name --acl public-read
```

4. **Create CloudFront Distribution** (optional):
   - Improves performance with CDN
   - Configure in AWS Console

### Option 4: GitHub Pages

1. **Install gh-pages**:
```bash
cd frontend
yarn add -D gh-pages
```

2. **Update package.json**:
```json
{
  "homepage": "https://yourusername.github.io/repository-name",
  "scripts": {
    "predeploy": "yarn build",
    "deploy": "gh-pages -d build"
  }
}
```

3. **Deploy**:
```bash
yarn deploy
```

## Docker Compose (Full Stack)

**docker-compose.yml** (create in root directory):
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: rental-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    container_name: rental-backend
    restart: always
    ports:
      - "8001:8001"
    environment:
      MONGO_URL: mongodb://admin:password@mongodb:27017/
      DB_NAME: rental_management
      JWT_SECRET: your-secret-key
      CORS_ORIGINS: http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: rental-frontend
    restart: always
    ports:
      - "3000:80"
    environment:
      REACT_APP_BACKEND_URL: http://localhost:8001

volumes:
  mongodb_data:
```

**Frontend Dockerfile**:
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Run with Docker Compose**:
```bash
docker-compose up -d
```

## Common Issues

### CORS Errors
- Ensure `CORS_ORIGINS` in backend includes your frontend URL
- Check for trailing slashes in URLs
- Verify both HTTP and HTTPS if applicable

### Database Connection Failed
- Check MongoDB connection string format
- Verify username/password are correct
- Ensure IP whitelist includes your server
- Test connection: `mongosh "your-connection-string"`

### Port Already in Use
```bash
# Kill process on specific port
lsof -ti:8001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

### Environment Variables Not Loading
- Restart the application after changing .env
- Check file is named exactly `.env`
- Verify environment variables in deployment platform dashboard

### Build Failures
```bash
# Clear caches and reinstall
rm -rf node_modules yarn.lock
yarn install

# Backend
rm -rf venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a secure random string
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure MongoDB authentication
- [ ] Restrict MongoDB IP access
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting (e.g., with slowapi)
- [ ] Regular security updates for dependencies
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for MongoDB

## Monitoring

### Backend Health Check
```python
# Add to server.py
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}
```

### Recommended Monitoring Tools
- **Sentry**: Error tracking
- **DataDog**: Application monitoring
- **MongoDB Atlas Monitoring**: Database performance
- **UptimeRobot**: Uptime monitoring

## Support

For deployment issues:
- Check logs: `heroku logs --tail` (Heroku)
- Review application logs in your deployment platform
- Verify all environment variables are set correctly
- Test database connection separately
