# 🚨 CRITICAL: Set Root Directory in Railway

## The Problem
Railway is analyzing your **repository root** (`/instahome/`) instead of your **backend directory** (`/instahome/backend/`).

## The Solution - Step by Step

### Step 1: Open Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Login to your account
3. Click on your **project**

### Step 2: Select Your Service
- Click on the **service** that's failing (it might be named after your repo or "web")

### Step 3: Open Settings
- Click the **Settings** tab (or the ⚙️ gear icon)
- Scroll down to find the **Source** section

### Step 4: Set Root Directory
Look for a field labeled **"Root Directory"** or **"Root"**

**Set it to exactly:**
```
backend
```

**OR if your repo structure is different:**
```
instahome/backend
```

### Step 5: Save and Redeploy
1. Click **Save** or **Update**
2. Railway will automatically trigger a new deployment
3. Watch the logs - you should now see Python detection!

## Visual Guide (Where to Find It)

```
Railway Dashboard
├── Your Project
    ├── Your Service
        ├── Settings Tab ⚙️
            ├── Source Section
                └── Root Directory: [backend] ← SET THIS!
```

## Alternative: Using Railway CLI

If you prefer CLI, you can't set root directory via CLI, but you can:

1. **Delete and recreate the service with correct root:**
```bash
cd backend
railway init
railway up
```

This will create a new service pointing directly to the backend directory.

## Verify It's Working

After setting the root directory, check the build logs. You should see:

✅ **Good signs:**
```
✓ Detected Python
✓ Installing dependencies from requirements.txt
✓ Starting uvicorn server:app
```

❌ **Bad signs (what you're seeing now):**
```
✖ Railpack could not determine how to build the app
The app contents that Railpack analyzed contains: ./backend/
```

## Still Not Working?

### Option 1: Check Your Repo Structure
Make sure your backend files are actually in `backend/`:
- `backend/server.py` ✅
- `backend/requirements.txt` ✅
- `backend/Procfile` ✅

### Option 2: Try Different Root Paths
Try these in order:
1. `backend`
2. `instahome/backend`
3. `./backend`

### Option 3: Create New Service
1. Delete the current service
2. Create a new service
3. When prompted for root directory, enter: `backend`
4. Deploy

## Quick Test

After setting root directory, the logs should show:
```
The app contents that Railpack analyzed contains:
./
├── server.py          ← Should see this!
├── requirements.txt   ← Should see this!
├── Procfile           ← Should see this!
└── nixpacks.toml      ← Should see this!
```

Instead of:
```
./
├── backend/           ← Currently seeing this (wrong!)
├── frontend/
└── ...
```

## Need More Help?

If you're still stuck:
1. Take a screenshot of your Railway Settings → Source section
2. Check Railway Discord: https://discord.gg/railway
3. Railway Docs: https://docs.railway.app/deploy/builds#root-directory

