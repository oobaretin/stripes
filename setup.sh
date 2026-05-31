#!/bin/bash

echo "🚀 Setting up Striply (local-first frontend)"
echo ""

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
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "  npm run dev     → http://localhost:3000"
echo "  /sell           → public seller landing page"
echo "  /dashboard      → business dashboard (data in this browser only)"
echo ""
