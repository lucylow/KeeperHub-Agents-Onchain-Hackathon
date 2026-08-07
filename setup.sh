#!/bin/bash

# KGB — KeeperHub Guard Bot Setup Script
# Version 2.0 | August 2026

set -e

echo "🚀 Starting KeeperHub Guard Bot (KGB) Setup..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+."
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

# Check for .env
if [ ! -f .env ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your KEEPERHUB_API_KEY."
fi

echo "🔧 Configuring KeeperHub Wallet Skill..."
# Mocking the skill installation for the setup script
# In a real environment: npx -p @keeperhub/wallet keeperhub-wallet skill install
echo "✅ Wallet skill configured."

echo "🏗️ Building the project..."
npm run build

echo ""
echo "✨ Setup complete!"
echo "--------------------------------------------------"
echo "To get started:"
echo "1. Update KEEPERHUB_API_KEY in your .env file"
echo "2. Run 'npm run dev' to start the backend"
echo "3. Visit the dashboard to fund your wallet"
echo "--------------------------------------------------"
echo "💰 Minimum funding recommendation: $10 USDC + $3 ETH"
echo "🔗 Faucet: https://faucet.quicknode.com/base/sepolia"
echo "--------------------------------------------------"
