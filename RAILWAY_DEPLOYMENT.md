# Railway Deployment Guide

## Why Railway?

✅ **Built-in PostgreSQL** - Free PostgreSQL database included  
✅ **Easy Setup** - Connect GitHub repo, Railway handles the rest  
✅ **Free Tier** - $5 credit/month (usually enough for small apps)  
✅ **Simple Environment Variables** - Easy configuration  
✅ **Automatic Deployments** - Deploys on every push  

## Deployment Steps

### 1. Sign Up for Railway

1. Go to https://railway.app
2. Sign up with GitHub (recommended) or email
3. You'll get $5 free credit/month

### 2. Create PostgreSQL Database

1. Click **"New Project"**
2. Click **"Add Service"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will create a PostgreSQL database
4. Click on the database service
5. Go to **"Variables"** tab
6. Copy the `DATABASE_URL` - you'll need this!

### 3. Deploy Backend

1. In your Railway project, click **"New Service"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `striply` repository
4. Railway will detect it's a Node.js app
5. Set the **Root Directory** to `backend`

### 4. Configure Backend Environment Variables

In your backend service, go to **"Variables"** tab and add:

```
DATABASE_URL=<paste the DATABASE_URL from PostgreSQL service>
JWT_SECRET=<generate a strong random string>
NODE_ENV=production
PORT=3001
```

**To generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Update Prisma for PostgreSQL

The schema needs to be updated from SQLite to PostgreSQL. See `MIGRATE_TO_POSTGRES.md` for details.

### 6. Run Database Migrations

After deployment, you can run migrations via Railway's CLI or add a build command:

**Option A: Via Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway link  # Link to your project
cd backend
railway run npm run db:push
```

**Option B: Add to package.json build script**
Railway will run `npm run build` automatically, but you can also add a postinstall script.

### 7. Get Your Backend URL

1. Go to your backend service in Railway
2. Click **"Settings"** → **"Generate Domain"**
3. Copy the URL (e.g., `striply-backend-production.up.railway.app`)

### 8. Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Framework: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`

### 9. Configure Frontend Environment Variables

In Vercel, add:
```
VITE_API_URL=https://your-railway-backend-url.up.railway.app/api
```

### 10. Update CORS in Backend

Make sure your backend allows requests from your Vercel domain. The backend already has CORS enabled, but you may want to restrict it to your frontend domain.

## Cost Estimate

- **Railway**: Free tier includes $5/month credit
  - PostgreSQL: ~$0.50/month (small database)
  - Backend hosting: ~$0.50-2/month (depending on usage)
  - **Total: Usually free or < $5/month**

- **Vercel**: Free tier available
  - Frontend hosting: Free for personal projects
  - **Total: Free**

## Troubleshooting

### Database Connection Issues
- Make sure `DATABASE_URL` is set correctly
- Check that PostgreSQL service is running
- Verify Prisma schema is set to `postgresql`

### Build Failures
- Check Railway logs: Click on your service → "Deployments" → Click on failed deployment
- Make sure all environment variables are set
- Verify `package.json` scripts are correct

### CORS Errors
- Update CORS settings in `backend/src/index.ts`
- Add your Vercel domain to allowed origins

## Next Steps After Deployment

1. **Seed Database**: Run your seed scripts via Railway CLI
   ```bash
   railway run npm run seed:buyers
   railway run npm run seed:categories
   ```

2. **Test API**: Visit `https://your-backend-url.up.railway.app/health`

3. **Test Frontend**: Visit your Vercel URL

4. **Monitor**: Check Railway dashboard for logs and metrics

## Railway CLI Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run commands in Railway environment
railway run npm run db:push
railway run npm run seed:buyers

# View logs
railway logs

# Open database in local client
railway connect
```

## Alternative: Render.com

If Railway doesn't work for you, **Render.com** is another great option:
- Free PostgreSQL database
- Free Node.js hosting (with limitations)
- Similar setup process
- Visit https://render.com

