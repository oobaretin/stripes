# Striply - Diabetic Test Strip Business Management System

A comprehensive all-in-one application for managing a diabetic test strip business. Striply helps you track customers (suppliers), buyers (resale customers), products, purchases, and sales with advanced profit optimization features.

## 🚀 Features

- **Business Owner Management**: Register and manage your business profile
- **Customer Management**: Track suppliers you buy test strips from
- **Buyer Management**: Manage your resale customers with price lists
- **Product Management**: Maintain a comprehensive list of test strip products with NDC codes
- **Purchase Tracking**: Record purchases from customers with detailed item tracking
- **Sales Tracking**: Track sales to buyers with profit calculations
- **Profit Optimization**: Calculate recommended purchase prices based on buyer prices and target profit margins
- **Price Comparison**: Compare prices across multiple buyers dynamically
- **Dashboard**: View business statistics, financials, and recent activity
- **Seller Landing Page**: Public-facing page for sellers to learn about your business

## 🛠 Tech Stack

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM with SQLite (can be upgraded to PostgreSQL)
- JWT Authentication
- Express Validator for input validation

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Lucide React for icons

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git

## 🏃 Getting Started

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/oobaretin/striply.git
   cd striply
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   ```

3. **Set up the backend environment:**
   ```bash
   cd backend
   cp .env.example .env  # If you have an example file
   ```
   
   Create `.env` file with:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   DATABASE_URL="file:./dev.db"
   PORT=3001
   NODE_ENV=development
   ```

4. **Initialize the database:**
   ```bash
   cd backend
   npm run db:generate
   npm run db:push
   ```

5. **Start the development servers:**
   
   From the root directory:
   ```bash
   npm run dev
   ```
   
   This starts both backend (port 3001) and frontend (port 3000) concurrently.

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Landing Page: http://localhost:3000/sell

## 🎯 First Time Setup

1. Navigate to http://localhost:3000
2. Click "Create a new account" or go to `/register`
3. Fill in your business owner information
4. Once registered, you'll be automatically logged in
5. Start adding buyers, products, and managing your business!

## 📁 Project Structure

```
striply/
├── backend/
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Auth and error handling
│   │   ├── lib/          # Prisma client
│   │   ├── scripts/      # Database seeding scripts
│   │   └── index.ts      # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/        # React page components
│   │   ├── components/   # Reusable components
│   │   ├── lib/          # API client
│   │   └── App.tsx       # Main app component
│   ├── public/           # Static assets
│   └── package.json
└── package.json          # Root workspace config
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new business owner
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Deactivate customer

### Buyers
- `GET /api/buyers` - List all buyers
- `GET /api/buyers/:id` - Get buyer details
- `POST /api/buyers` - Create buyer
- `PUT /api/buyers/:id` - Update buyer
- `DELETE /api/buyers/:id` - Deactivate buyer

### Products & Categories
- `GET /api/categories` - List all categories with products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Deactivate product

### Purchases
- `GET /api/purchases` - List all purchases
- `GET /api/purchases/:id` - Get purchase details
- `POST /api/purchases` - Create purchase
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase

### Sales
- `GET /api/sales` - List all sales
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🗄 Database Schema

The application uses SQLite with Prisma ORM. Key entities:

- **BusinessOwner**: Your business profile
- **Customer**: Suppliers you buy from
- **Buyer**: Customers you resell to (with price lists)
- **Category**: Product categories (e.g., Test Strips, CGM Devices)
- **SubCategory**: Subcategories within categories
- **Product**: Test strip products with NDC codes
- **BuyerPrice**: Prices buyers offer for products (with expiration ranges)
- **Purchase**: Purchases from customers with items
- **Sale**: Sales to buyers with items

## 🚀 Deployment

### Deploy to Vercel

#### Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository connected (already done!)

#### Frontend Deployment

1. **Install Vercel CLI (optional but recommended):**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from root directory:**
   ```bash
   cd frontend
   vercel
   ```
   
   Or deploy via Vercel Dashboard:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Set Root Directory to `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables:**
   Add to Vercel project settings:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```

#### Backend Deployment

1. **Create `vercel.json` in backend directory:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/index.ts"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

2. **Deploy backend:**
   ```bash
   cd backend
   vercel
   ```

3. **Environment Variables in Vercel:**
   ```
   JWT_SECRET=your-production-jwt-secret
   DATABASE_URL=your-database-url
   PORT=3001
   NODE_ENV=production
   ```

**Note:** For production, consider:
- Using PostgreSQL instead of SQLite (SQLite files don't persist on Vercel)
- Using Vercel Postgres or another database service
- Setting up proper CORS for your frontend domain

### Alternative: Deploy Backend Separately

For better scalability, deploy backend to:
- **Railway** (https://railway.app) - Easy PostgreSQL setup
- **Render** (https://render.com) - Free tier available
- **Fly.io** (https://fly.io) - Great for Node.js apps
- **DigitalOcean App Platform** - Simple deployment

Then update `VITE_API_URL` in frontend to point to your backend URL.

## 🔒 Security Notes

- Passwords are hashed using bcrypt (12 rounds)
- JWT tokens expire after 7 days
- All API routes (except auth) require authentication
- Input validation on all endpoints using express-validator
- SQL injection protection via Prisma ORM
- CORS enabled for frontend domain
- Environment variables for sensitive data

## 📝 Development Scripts

### Backend Scripts
```bash
cd backend

# Database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:studio      # Open Prisma Studio
npm run db:migrate     # Create migration

# Seeding
npm run seed:buyers              # Seed buyers
npm run seed:categories          # Seed categories and products
npm run import:products          # Import products from price sheets
npm run add:buyer-prices        # Add buyer prices
npm run add:ralph-walton        # Add Ralph Walton prices
npm run add:path-medical        # Add Path Medical prices
npm run add:chris-sampson       # Add Chris Sampson prices
npm run add:charles-harris      # Add Charles Harris prices
```

### Frontend Scripts
```bash
cd frontend

npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🐛 Troubleshooting

### Database Issues
- If database is corrupted, delete `backend/dev.db` and run `npm run db:push` again
- Make sure Prisma client is generated: `npm run db:generate`

### Port Already in Use
- Backend default: 3001
- Frontend default: 3000
- Change ports in `.env` files if needed

### Build Errors
- Make sure all dependencies are installed: `npm run install:all`
- Clear node_modules and reinstall if needed

## 📄 License

This project is private and proprietary.

## 👥 Support

For issues or questions, please contact the development team or open an issue on GitHub.

## 🔗 Links

- **Repository**: https://github.com/oobaretin/striply
- **Landing Page**: `/sell` route (public)
- **Admin Dashboard**: `/dashboard` route (requires login)

---

Built with ❤️ for efficient diabetic test strip business management.
