# MongoDB Connection Fix for Railway

## Problem
Getting 500 errors with 30-second timeouts on Railway. The issue is MongoDB connection failure.

## Root Cause
MongoDB Atlas is blocking connections from Railway because Railway's IP addresses are not whitelisted.

## Solution: Whitelist Railway IPs in MongoDB Atlas

### Step 1: Go to MongoDB Atlas Network Access

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Click **"Network Access"** in the left sidebar

### Step 2: Add IP Address

You have two options:

#### Option A: Allow All IPs (Quick Fix for Testing)
1. Click **"Add IP Address"**
2. Click **"Allow Access from Anywhere"**
3. This will add `0.0.0.0/0` to your whitelist
4. ⚠️ **Warning**: This allows access from anywhere. Use only for testing.

#### Option B: Find Railway's IP Ranges (More Secure)
Railway uses dynamic IPs, but you can:
1. Check Railway logs to see the source IP
2. Or temporarily use `0.0.0.0/0` and monitor MongoDB Atlas logs for Railway IPs
3. Then restrict to specific IPs later

### Step 3: Verify Connection String

In Railway → Variables, ensure `MONGO_URL` is in the correct format:

```
mongodb+srv://username:password@cluster.mongodb.net/
```

**Important:**
- Must start with `mongodb+srv://`
- Username and password should be URL-encoded if they contain special characters
- No database name at the end (that's set by `DB_NAME` variable)

### Step 4: Test Connection

After whitelisting IPs, test the health endpoint:

```bash
curl https://instahome-production.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "database_name": "your_db_name",
  "database_exists": true
}
```

## Common Issues

### Issue 1: SSL Handshake Error
**Error**: `SSL handshake failed: tlsv1 alert internal error`

**Solution**: 
- Verify connection string uses `mongodb+srv://`
- Check MongoDB Atlas → Network Access → IP whitelist
- Ensure Railway's IPs are whitelisted

### Issue 2: Connection Timeout
**Error**: 30-second timeout

**Solution**:
- MongoDB Atlas is blocking the connection
- Add `0.0.0.0/0` to IP whitelist temporarily
- Or find Railway's specific IP ranges

### Issue 3: Authentication Failed
**Error**: `Authentication failed`

**Solution**:
- Check username/password in `MONGO_URL`
- Verify database user exists in MongoDB Atlas → Database Access
- Ensure user has proper permissions

## Verification Checklist

- [ ] MongoDB Atlas → Network Access → IP whitelist includes `0.0.0.0/0` (or Railway IPs)
- [ ] Railway → Variables → `MONGO_URL` is correct format
- [ ] Railway → Variables → `DB_NAME` doesn't contain periods
- [ ] MongoDB Atlas → Database Access → User exists and has permissions
- [ ] Health endpoint returns `"status": "healthy"`

## After Fixing

1. Deploy the updated code to Railway
2. Test: `curl https://instahome-production.up.railway.app/api/health`
3. Test: `curl https://instahome-production.up.railway.app/api/properties`
4. Should return `[]` (empty array) if no data, or proper error if connection still fails

## Security Note

For production:
- Consider restricting IP whitelist to specific Railway IP ranges
- Use MongoDB Atlas VPC peering if available
- Monitor MongoDB Atlas logs for suspicious connections

