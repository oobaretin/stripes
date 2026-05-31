#!/bin/bash

echo "🚀 Setting up Striply (local-first frontend)"
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""
echo "📦 Installing frontend dependencies..."
npm install --prefix frontend --include=optional

echo ""
echo "✅ Setup complete!"
echo ""
echo "  npm run dev     → http://localhost:3000"
echo "  /sell           → public seller landing page"
echo "  /dashboard      → business dashboard (data in this browser only)"
echo ""
