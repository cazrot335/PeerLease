#!/bin/bash

# 🚀 TON Rental Marketplace Bot - Quick Start Script

echo "🤖 TON Rental Marketplace Bot"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Create .env with:"
    echo "TELEGRAM_BOT_TOKEN=your_token"
    echo "TON_CONTRACT_ADDRESS=your_contract"
    echo "OWNER_WALLET_ADDRESS=your_wallet"
    echo "TON_NETWORK=testnet"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check environment variables
echo "✅ Checking environment..."
if grep -q "TELEGRAM_BOT_TOKEN=" .env && grep -q "TON_CONTRACT_ADDRESS=" .env; then
    echo "✅ Environment variables found"
else
    echo "❌ Missing required environment variables"
    exit 1
fi

echo ""
echo "🚀 Starting bot..."
echo ""

# Start the bot
node bot.js
