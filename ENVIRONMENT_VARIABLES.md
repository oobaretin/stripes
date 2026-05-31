# Environment Variables Reference

Complete list of all environment variables needed for Striply deployment.

## 🔧 Backend Environment Variables

### Required Variables

#### `DATABASE_URL`
- **Description**: PostgreSQL database connection string
- **Format**: `postgresql://user:password@host:port/database?schema=public`
- **Where to get it**: Railway PostgreSQL service → Variables tab
- **Example**: 
  ```
  postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
  ```
- **Local Development**: `file:./dev.db` (for SQLite)

#### `JWT_SECRET`
- **Description**: Secret key for signing JWT tokens (authentication)
- **Required**: Yes (must be set)
- **How to generate**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Example**: 
  ```
  a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
  ```
- **Security**: Use a strong random string (at least 32 characters)

### Optional Variables (with defaults)

#### `PORT`
- **Description**: Port number for the backend server
- **Default**: `3001`
- **Example**: `3001`
- **Note**: Railway usually sets this automatically, but you can override

#### `NODE_ENV`
- **Description**: Environment mode (development, production, test)
- **Default**: `development`
- **Production**: `production`
- **Values**: `development` | `production` | `test`
- **Note**: Affects error messages, logging, and CORS behavior

## 🎨 Frontend Environment Variables

### Required Variables

#### `VITE_API_URL`
- **Description**: Base URL for the backend API
- **Format**: `https://your-backend-url.up.railway.app/api`
- **Local Development**: `http://localhost:3001/api` (default fallback)
- **Example**:
  ```
  https://striply-backend-production.up.railway.app/api
  ```
- **Note**: Must include `/api` at the end
- **Important**: In Vite, all environment variables must be prefixed with `VITE_`

## 📋 Complete Variable List by Service

### Backend Service (Railway)

```env
# Required
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Optional (with defaults)
PORT=3001
NODE_ENV=production
```

### Frontend Service (Railway)

```env
# Required
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

### PostgreSQL Database (Railway - Auto-generated)

Railway automatically provides:
- `DATABASE_URL` - Connection string (copy this to backend service)
- `PGHOST` - Database host
- `PGPORT` - Database port
- `PGDATABASE` - Database name
- `PGUSER` - Database user
- `PGPASSWORD` - Database password

**You only need to copy `DATABASE_URL` to your backend service.**

## 🔐 Security Best Practices

### JWT_SECRET
- ✅ Use a long random string (minimum 32 characters)
- ✅ Never commit to git
- ✅ Use different secrets for development and production
- ✅ Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### DATABASE_URL
- ✅ Never commit to git
- ✅ Use Railway's provided connection string
- ✅ Contains sensitive credentials

### VITE_API_URL
- ✅ Can be public (no sensitive data)
- ✅ Must match your backend deployment URL
- ✅ Include `/api` suffix

## 📝 Setting Variables in Railway

### For Backend Service:

1. Go to your backend service in Railway
2. Click **"Variables"** tab
3. Click **"New Variable"**
4. Add each variable:
   - `DATABASE_URL` = (copy from PostgreSQL service)
   - `JWT_SECRET` = (generate your own)
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (optional, Railway sets this)

### For Frontend Service:

1. Go to your frontend service in Railway
2. Click **"Variables"** tab
3. Click **"New Variable"**
4. Add:
   - `VITE_API_URL` = `https://your-backend-url.up.railway.app/api`

### For PostgreSQL Service:

Railway automatically creates these - you don't need to set them manually. Just copy `DATABASE_URL` to your backend service.

## 🧪 Local Development Variables

### Backend `.env` file:

```env
# Database (SQLite for local dev)
DATABASE_URL="file:./dev.db"

# JWT Secret (use a different one for local dev)
JWT_SECRET=local-development-secret-key-change-in-production

# Port
PORT=3001

# Environment
NODE_ENV=development
```

### Frontend `.env` file (optional):

```env
# API URL (defaults to localhost if not set)
VITE_API_URL=http://localhost:3001/api
```

**Note**: Frontend doesn't need `.env` file locally - it defaults to `http://localhost:3001/api`

## ✅ Quick Checklist

### Backend Variables:
- [ ] `DATABASE_URL` - From Railway PostgreSQL service
- [ ] `JWT_SECRET` - Generated strong random string
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Optional (Railway sets automatically)

### Frontend Variables:
- [ ] `VITE_API_URL` - Your backend URL + `/api`

## 🚨 Common Mistakes

1. **Missing `/api` in VITE_API_URL**
   - ❌ Wrong: `https://backend.railway.app`
   - ✅ Correct: `https://backend.railway.app/api`

2. **Wrong DATABASE_URL format**
   - ❌ Wrong: `file:./dev.db` (SQLite - won't work on Railway)
   - ✅ Correct: `postgresql://user:pass@host:port/db`

3. **Weak JWT_SECRET**
   - ❌ Wrong: `secret123`
   - ✅ Correct: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

4. **Forgot VITE_ prefix**
   - ❌ Wrong: `API_URL=...`
   - ✅ Correct: `VITE_API_URL=...`

## 🔍 How to Verify Variables

### Check Backend Variables:
```bash
# Via Railway CLI
railway variables

# Or check Railway dashboard → Service → Variables
```

### Test Backend Connection:
```bash
# Health check
curl https://your-backend-url.railway.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Test Frontend Connection:
- Open browser console
- Check Network tab for API calls
- Should connect to your backend URL

## 📚 Additional Resources

- Railway Environment Variables: https://docs.railway.app/develop/variables
- Vite Environment Variables: https://vitejs.dev/guide/env-and-mode.html
- Prisma Connection Strings: https://www.prisma.io/docs/concepts/database-connectors/postgresql

---

**Summary**: You need 2 variables for backend (`DATABASE_URL`, `JWT_SECRET`) and 1 for frontend (`VITE_API_URL`). That's it! 🎉

