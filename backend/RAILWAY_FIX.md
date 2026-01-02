# Quick Fix: Railway Root Directory Issue

## Problem
Railway is analyzing the repository root instead of the `backend` directory, causing the error:
```
✖ Railpack could not determine how to build the app.
```

## Solution (2 minutes)

### Step 1: Configure Root Directory in Railway Dashboard

1. **Go to Railway Dashboard**
   - Open your project: [railway.app](https://railway.app)
   - Click on your service

2. **Open Settings**
   - Click **Settings** tab (or gear icon)
   - Scroll to **Source** section

3. **Set Root Directory**
   - Find **Root Directory** field
   - Set it to: `instahome/backend`
   - Or if your repo structure is different: `backend`
   - Click **Save**

4. **Redeploy**
   - Railway will automatically trigger a new deployment
   - Or click **Deploy** button manually

### Step 2: Verify Files Are Present

Make sure these files exist in your `backend` directory:
- ✅ `server.py` - Your FastAPI app
- ✅ `requirements.txt` - Python dependencies
- ✅ `Procfile` - Start command
- ✅ `nixpacks.toml` - Build configuration (we created this)
- ✅ `runtime.txt` - Python version (we created this)

### Step 3: Check Environment Variables

Ensure these are set in Railway → Variables:
- `MONGO_URL`
- `DB_NAME`
- `JWT_SECRET`
- `CORS_ORIGINS`

## Alternative: Using Railway CLI

If you prefer CLI:

```bash
# Navigate to backend directory
cd instahome/backend

# Link to Railway (if not already done)
railway link

# Set root directory via Railway dashboard (CLI doesn't support this setting)
# Then deploy
railway up
```

## Verification

After setting the root directory, Railway should:
1. Detect Python automatically
2. Install dependencies from `requirements.txt`
3. Start the app using `Procfile` or `nixpacks.toml`

Check logs:
```bash
railway logs
```

You should see:
```
✓ Detected Python
✓ Installing dependencies...
✓ Starting application...
```

## Still Having Issues?

1. **Check the root directory path** - Make sure it matches your repo structure
2. **Verify files are committed** - Railway only sees committed files
3. **Check build logs** - Look for specific error messages
4. **Try manual build command** - In Railway settings, you can override build commands

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

