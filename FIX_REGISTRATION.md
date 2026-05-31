# Fix Registration Error

## Common Causes

### 1. Database Schema Not Initialized ⚠️ MOST LIKELY

The database tables might not exist yet. You need to push the Prisma schema first.

**Fix:**
```bash
cd backend
npx @railway/cli run npm run db:push
```

### 2. JWT_SECRET Not Set

Railway backend needs `JWT_SECRET` environment variable.

**Fix:**
1. Railway Dashboard → Backend Service → Variables
2. Add: `JWT_SECRET` = (generate a random string)
3. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. Database Connection Issue

Backend can't connect to PostgreSQL.

**Check:**
- Railway Dashboard → PostgreSQL Service → Is it running?
- Railway Dashboard → Backend Service → Variables → `DATABASE_URL` is set?

## Quick Diagnostic

### Check Backend Health
Open in browser: `https://your-backend-url.up.railway.app/health`

Should return: `{"status":"ok","timestamp":"..."}`

### Check Database Schema
```bash
cd backend
npx @railway/cli run npm run db:push
```

### Check Railway Logs
Railway Dashboard → Backend Service → Logs
Look for:
- Database connection errors
- JWT_SECRET errors
- Prisma errors

## Step-by-Step Fix

1. **Push Database Schema:**
   ```bash
   cd backend
   npx @railway/cli run npm run db:push
   ```

2. **Verify JWT_SECRET:**
   - Railway Dashboard → Backend Service → Variables
   - Make sure `JWT_SECRET` exists

3. **Try Registration Again:**
   - Go to `/register` page
   - Fill in the form
   - Check browser console (F12) for specific errors

4. **Check Railway Logs:**
   - Look for specific error messages
   - Share the error if still failing

## Most Likely Issue

**Database schema not pushed!** Run:
```bash
cd backend
npx @railway/cli run npm run db:push
```

Then try registering again!

