# Railway Deployment Guide

This guide will help you deploy your FastAPI backend to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Railway works best with GitHub integration
3. **MongoDB Atlas**: Set up a MongoDB database (or use Railway's MongoDB plugin)

## Quick Start (5 minutes)

### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `instahome/backend` directory as the root directory

3. **Configure Environment Variables**
   - Go to your service → Variables tab
   - Add the following variables:
     ```
     MONGO_URL=your-mongodb-connection-string
     DB_NAME=rental_management_prod
     JWT_SECRET=your-secure-jwt-secret-here
     CORS_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
     PORT=8000
     ```
   - Railway will automatically set `PORT`, but you can override it

4. **Deploy**
   - Railway will automatically detect Python and FastAPI
   - It will install dependencies from `requirements.txt`
   - The app will start using the `Procfile`

5. **Get Your URL**
   - Railway provides a URL like: `https://your-app-name.up.railway.app`
   - You can also set a custom domain in Settings → Networking

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Railway in your project**
   ```bash
   cd instahome/backend
   railway init
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set MONGO_URL="your-mongodb-connection-string"
   railway variables set DB_NAME="rental_management_prod"
   railway variables set JWT_SECRET="your-secure-jwt-secret-here"
   railway variables set CORS_ORIGINS="https://your-frontend-domain.com,http://localhost:3000"
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **View Logs**
   ```bash
   railway logs
   ```

## Environment Variables Setup

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DB_NAME` | Database name | `rental_management_prod` |
| `JWT_SECRET` | Secret key for JWT tokens | Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `https://your-app.vercel.app,http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port to run the server | Railway sets this automatically |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_EXPIRATION_DAYS` | JWT expiration in days | `7` |

## MongoDB Setup Options

### Option 1: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist Railway's IP (or use `0.0.0.0/0` for testing)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/`

### Option 2: Railway MongoDB Plugin

1. In Railway dashboard, click "New" → "Database" → "Add MongoDB"
2. Railway will create a MongoDB instance
3. Copy the `MONGO_URL` from the MongoDB service variables
4. Use it in your backend service

## Custom Domain Setup

1. Go to your service → Settings → Networking
2. Click "Generate Domain" or "Add Custom Domain"
3. For custom domain:
   - Add your domain (e.g., `api.yourdomain.com`)
   - Follow DNS instructions to add CNAME record
   - Railway will automatically provision SSL certificate

## Monitoring & Logs

### View Logs
- **Dashboard**: Go to your service → Logs tab
- **CLI**: `railway logs`

### Health Check
Your API includes a root endpoint:
```bash
curl https://your-app.up.railway.app/api/
```

## Troubleshooting

### Build Fails
- Check that `requirements.txt` is in the backend directory
- Verify Python version (Railway auto-detects, but you can specify in `runtime.txt`)

### App Crashes on Start
- Check logs: `railway logs`
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

### CORS Errors
- Make sure `CORS_ORIGINS` includes your frontend URL
- No trailing slashes in URLs
- Include both HTTP and HTTPS if needed

### Database Connection Failed
- Verify MongoDB connection string format
- Check MongoDB IP whitelist includes Railway's IPs
- Test connection: `mongosh "your-connection-string"`

## Updating Your Deployment

### Automatic Deployments
- Railway automatically deploys when you push to your main branch
- You can configure branch settings in Settings → Source

### Manual Deploy
```bash
railway up
```

### Rollback
- Go to Deployments tab
- Click on a previous deployment
- Click "Redeploy"

## Cost & Limits

### Free Tier
- $5 credit per month
- 500 hours of usage
- Perfect for development and small projects

### Paid Plans
- Start at $5/month for additional resources
- See [railway.app/pricing](https://railway.app/pricing)

## Security Checklist

Before going to production:

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Use MongoDB Atlas with authentication enabled
- [ ] Restrict MongoDB IP whitelist (remove `0.0.0.0/0`)
- [ ] Set proper `CORS_ORIGINS` (remove `*`)
- [ ] Enable Railway's built-in monitoring
- [ ] Set up custom domain with SSL
- [ ] Review and update dependencies regularly

## Next Steps

1. Deploy your frontend (Vercel, Netlify, etc.)
2. Update frontend `REACT_APP_BACKEND_URL` to your Railway URL
3. Test all endpoints
4. Set up monitoring (Sentry, etc.)
5. Configure backups for MongoDB

## Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Status: [status.railway.app](https://status.railway.app)

