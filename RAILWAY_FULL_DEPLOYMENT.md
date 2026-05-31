# Complete Railway Deployment Guide (Frontend + Backend)

Deploy everything on Railway - it's simpler and keeps everything in one place!

## Why Railway for Everything?

✅ **One Platform** - Frontend, backend, and database all in one place  
✅ **Free Tier** - $5 credit/month (usually enough for small apps)  
✅ **Built-in PostgreSQL** - Database included  
✅ **Static Site Hosting** - Can host your React frontend  
✅ **Automatic Deployments** - Deploys on every GitHub push  
✅ **Simple Setup** - Connect GitHub, Railway handles the rest  

## Complete Deployment Steps

### 1. Sign Up for Railway

1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. You'll get $5 free credit/month

### 2. Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `striply` repository
4. Railway will detect it's a monorepo

### 3. Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will create a PostgreSQL database automatically
3. Click on the database service
4. Go to **"Variables"** tab
5. Copy the `DATABASE_URL` - you'll need this!

### 4. Deploy Backend Service

1. In your Railway project, click **"New"** → **"GitHub Repo"**
2. Select your `striply` repository again
3. Railway will ask for configuration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Watch Paths**: `backend/**`

4. Go to **"Variables"** tab and add:
   ```
   DATABASE_URL=<paste from PostgreSQL service>
   JWT_SECRET=<generate a strong random string>
   NODE_ENV=production
   PORT=3001
   ```

   **Generate JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Click **"Settings"** → **"Generate Domain"** to get your backend URL
   - Example: `striply-backend-production.up.railway.app`
   - Copy this URL - you'll need it for the frontend!

### 5. Switch Backend to PostgreSQL

Before deploying, update your Prisma schema:

```bash
cd backend
./scripts/switch-to-postgres.sh
npm run db:generate
```

Or manually edit `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 6. Run Database Migrations

After backend is deployed, run migrations:

**Option A: Via Railway Dashboard**
1. Go to your backend service
2. Click **"Deployments"** → **"View Logs"**
3. Click **"Run Command"** (or use the terminal icon)
4. Run: `npx prisma db push`

**Option B: Via Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway link  # Link to your project
cd backend
railway run npx prisma db push
```

### 7. Deploy Frontend Service

1. In your Railway project, click **"New"** → **"GitHub Repo"**
2. Select your `striply` repository again
3. Railway will ask for configuration:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l 3000`
   - **Watch Paths**: `frontend/**`

4. Go to **"Variables"** tab and add:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app/api
   ```
   (Replace with your actual backend URL from step 4)

5. Click **"Settings"** → **"Generate Domain"** to get your frontend URL
   - Example: `striply-frontend-production.up.railway.app`

### 8. Alternative: Use Railway Static Site (Recommended)

Railway also supports static site hosting which is better for frontends:

1. In your Railway project, click **"New"** → **"Static Site"**
2. Select your `striply` repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://your-backend-url.up.railway.app/api
     ```

4. Railway will automatically serve your static files
5. Get your frontend URL from the service

### 9. Update CORS in Backend (Important!)

Update `backend/src/index.ts` to allow your frontend domain:

```typescript
app.use(cors({
  origin: [
    'https://your-frontend-url.up.railway.app',
    'http://localhost:3000' // Keep for local dev
  ],
  credentials: true
}));
```

Or allow all origins (less secure, but easier for testing):
```typescript
app.use(cors()); // Already configured, but verify it works
```

### 10. Seed Your Database (Optional)

After deployment, seed your database with initial data:

```bash
railway run npm run seed:buyers
railway run npm run seed:categories
```

Or via Railway dashboard → Run Command

## Project Structure on Railway

Your Railway project will have 3 services:

```
Railway Project: striply
├── PostgreSQL Database
│   └── Provides DATABASE_URL
├── Backend Service
│   ├── Root: backend/
│   ├── Build: npm install && npm run build
│   ├── Start: npm start
│   └── Variables: DATABASE_URL, JWT_SECRET, etc.
└── Frontend Service (Static Site)
    ├── Root: frontend/
    ├── Build: npm install && npm run build
    ├── Output: dist/
    └── Variables: VITE_API_URL
```

## Cost Estimate

**Railway Free Tier:**
- PostgreSQL Database: ~$0.50/month
- Backend Service: ~$0.50-2/month (depending on usage)
- Frontend Static Site: ~$0.10/month
- **Total: Usually FREE or < $5/month** (within free tier)

## Environment Variables Summary

### Backend Service
```
DATABASE_URL=<from PostgreSQL service>
JWT_SECRET=<your-secret-key>
NODE_ENV=production
PORT=3001
```

### Frontend Service
```
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

## Testing Your Deployment

1. **Backend Health Check:**
   ```
   https://your-backend-url.up.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend:**
   ```
   https://your-frontend-url.up.railway.app
   ```
   Should show your landing page

3. **API Test:**
   ```
   https://your-backend-url.up.railway.app/
   ```
   Should show API info

## Troubleshooting

### Frontend Can't Connect to Backend
- Check `VITE_API_URL` is set correctly
- Verify backend URL is accessible
- Check CORS settings in backend
- Look at browser console for errors

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running
- Ensure Prisma schema is set to `postgresql`
- Run `railway run npx prisma db push`

### Build Failures
- Check Railway logs: Service → Deployments → Failed deployment
- Verify all environment variables are set
- Check `package.json` scripts are correct
- Ensure dependencies are in `package.json`

### CORS Errors
- Update CORS in `backend/src/index.ts`
- Add your frontend domain to allowed origins
- Check browser console for specific error

## Railway CLI Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run commands
railway run npm run db:push
railway run npm run seed:buyers

# Open database
railway connect
```

## Next Steps

1. ✅ Deploy backend and database
2. ✅ Deploy frontend
3. ✅ Test all endpoints
4. ✅ Seed database with initial data
5. ✅ Update CORS settings
6. ✅ Test registration/login flow
7. ✅ Monitor Railway dashboard for usage

## Custom Domains

Railway supports custom domains:

1. Go to your service → Settings → Domains
2. Add your custom domain (e.g., `api.striply.com`)
3. Update DNS records as instructed
4. Update `VITE_API_URL` in frontend to use custom domain

## Monitoring

- **Railway Dashboard**: View logs, metrics, and deployments
- **Service Health**: Check service status and uptime
- **Usage**: Monitor your $5 credit usage
- **Logs**: Real-time logs for debugging

---

**That's it!** Everything runs on Railway - simple, unified, and cost-effective! 🚀

