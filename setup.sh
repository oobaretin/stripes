#!/bin/bash

echo "🚀 Setting up Diabetic Test Strip Business Management System"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Set up Prisma
echo "🔧 Setting up database..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
DATABASE_URL="file:./dev.db"
JWT_SECRET="$(openssl rand -base64 32)"
PORT=3001
NODE_ENV=development
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

echo "🔧 Generating Prisma client..."
npm run db:generate

echo "🔧 Creating database..."
npm run db:push

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "This will start:"
echo "  - Backend API on http://localhost:3001"
echo "  - Frontend on http://localhost:3000"
echo ""
echo "First time setup:"
echo "  1. Navigate to http://localhost:3000"
echo "  2. Register your business owner account"
echo "  3. Start managing your business!"
echo ""




