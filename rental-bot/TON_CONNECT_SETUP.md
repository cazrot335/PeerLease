# 🔗 TON Connect Integration Setup Guide

## ✅ Overview

Your bot is now integrated with **TON Connect** for secure wallet-based payments. Users can pay directly from their TON wallets without sharing private keys.

---

## 🚀 Quick Start

### 1. **Verify Environment Setup**

Check your `.env` file has:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TON_CONTRACT_ADDRESS=your_contract_address
OWNER_WALLET_ADDRESS=your_wallet_address
TON_NETWORK=testnet
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Run Bot**

```bash
node bot.js
```

### 4. **Test in Telegram**

- Search for your bot in Telegram
- Send `/start`
- Click **"🏪 Rent Item"**
- Follow the steps

---

## 🔐 How TON Connect Works

### **Transaction Flow**

```
User clicks "Pay" button
    ↓
Bot generates transaction with TON Connect
    ↓
User gets deep link (ton://transfer/)
    ↓
User opens TON wallet (Tonkeeper, OpenMask, etc)
    ↓
User signs transaction
    ↓
Payment sent to contract
    ↓
Rental activated on blockchain
```

### **Key Components**

1. **TONConnectService.js** - Creates transactions
   - `createRentTransaction()` - For renting items
   - `createReturnTransaction()` - For returning items
   - `createDisputeTransaction()` - For reporting issues

2. **bot.js** - Manages flows
   - Collects rental details
   - Generates payment links
   - Tracks pending transactions

---

## 💳 Transaction Types

### **1. Rent Item Transaction**

**What happens:**
```javascript
Operation: 0x1 (rentItem)
Data:
  - Item ID
  - Owner wallet
  - Rental price
  - Security deposit
  - Duration (seconds)

Amount sent: Price + Deposit + 0.1 TON (gas)
```

**User flow:**
1. Click "🏪 Rent Item"
2. Enter item ID: `1`
3. Enter price: `2`
4. Enter deposit: `5`
5. Enter duration: `7` days
6. Click "💳 Pay with TON Wallet"
7. Wallet opens → User signs → Payment confirmed

---

### **2. Return Item Transaction**

**What happens:**
```javascript
Operation: 0x2 (returnItem)
Data:
  - Item ID to return

Amount sent: 0.05 TON (gas fee)
```

**User flow:**
1. Click "🔙 Return Item"
2. Enter rental item ID: `1`
3. Click "✅ Confirm Return"
4. Wallet opens → User signs → Item marked as returned
5. Deposit automatically returned

---

### **3. Dispute Transaction**

**What happens:**
```javascript
Operation: 0x3 (reportDispute)
Data:
  - Item ID
  - Dispute reason/description

Amount sent: 0.05 TON (gas fee)
```

**User flow:**
1. Click "⚠️ Report Issue"
2. Enter item ID: `1`
3. Describe problem: "Item has damage"
4. Click "📢 Submit Report"
5. Wallet opens → User signs → Dispute logged
6. Owner notified to review

---

## 🛠️ Configuration

### **Environment Variables**

```env
# Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token      # Get from @BotFather
TON_NETWORK=testnet                     # testnet or mainnet

# Smart Contract
TON_CONTRACT_ADDRESS=EQ...              # Your deployed contract
OWNER_WALLET_ADDRESS=0Q...              # Owner receives payments

# Optional
PORT=3000                               # For webhook mode
WEBHOOK_URL=https://your-domain.com     # For production
```

### **Network Selection**

**Testnet (for testing):**
```env
TON_NETWORK=testnet
```

**Mainnet (for production):**
```env
TON_NETWORK=mainnet
```

---

## 🎯 Core Functions

### **Create Rent Transaction**

```javascript
const transaction = tonService.createRentTransaction(
  itemId,           // Number (1, 2, 3, etc)
  ownerAddress,     // Wallet address
  price,            // TON amount (number)
  deposit,          // TON amount (number)
  duration          // Seconds
);

// Result:
{
  address: "EQ...",              // Contract address
  amount: "7000000000",          // In nanoTON
  payload: "base64_encoded_data" // Transaction data
}
```

### **Create Return Transaction**

```javascript
const transaction = tonService.createReturnTransaction(itemId);

// Result:
{
  address: "EQ...",
  amount: "50000000",            // 0.05 TON in nanoTON
  payload: "base64_encoded_data"
}
```

### **Create Dispute Transaction**

```javascript
const transaction = tonService.createDisputeTransaction(
  itemId,
  "Item is damaged" // Reason description
);

// Result:
{
  address: "EQ...",
  amount: "50000000",
  payload: "base64_encoded_data"
}
```

---

## 📱 Supported Wallets

Users can pay with any TON wallet that supports deep linking:

✅ **Tonkeeper** - Mobile wallet
✅ **OpenMask** - Browser extension
✅ **TonHub** - Mobile wallet
✅ **MyTonWallet** - Web wallet
✅ **Ledger** - Hardware wallet
✅ **Coinbase Wallet** - Multi-chain

All wallets show the transaction before user signs.

---

## 🔍 Testing

### **Testnet Testing (Recommended)**

1. **Get testnet TON:**
   - Go to https://testnet.tonconsole.com
   - Click "Get testnet tokens"
   - Enter your wallet address
   - Wait a few seconds

2. **Test rental flow:**
   ```
   /start → 🏪 Rent Item
   Item ID: 1
   Price: 0.1 (use small amount for testing)
   Deposit: 0.1
   Duration: 1
   → Click "Pay with TON Wallet"
   → Open wallet and sign
   ```

3. **Check transaction:**
   - https://testnet.tonscan.org
   - Search for your wallet address
   - Verify transaction confirmed

### **Verify Bot Status**

```bash
# In Telegram, send:
/status

# Should show:
✅ Bot Status

Server: Running ✓
Network: testnet
Contract: EQDaMahFbBsyXPEhHq...
Uptime: 5 minutes
```

---

## 💰 Gas Costs

Typical gas fees on TON testnet:

| Operation | Gas Fee |
|-----------|---------|
| Rent Item | 0.1 TON |
| Return Item | 0.05 TON |
| Report Dispute | 0.05 TON |

**Actual fees may vary based on network conditions.**

---

## ⚠️ Common Issues

### **Issue: "Transaction not confirmed"**

**Solution:**
- Check you have enough TON balance
- Verify testnet/mainnet selected correctly
- Ensure gas fee included in transaction amount

### **Issue: "Wallet doesn't open"**

**Solution:**
- Update your wallet app
- Try a different wallet
- Check internet connection

### **Issue: "Contract address invalid"**

**Solution:**
- Verify address format: `EQ...` or `0Q...`
- Check address in `.env` file
- Redeploy contract if needed

### **Issue: "Deep link not working"**

**Solution:**
- Reinstall wallet app
- Check if wallet installed on device
- Use browser wallet instead (MyTonWallet)

---

## 📊 Transaction Tracking

Bot stores pending transactions in memory:

```javascript
// Example pending transaction object
{
  type: 'rent',
  chatId: 123456,
  itemId: 1,
  price: 2,
  deposit: 5,
  duration: 604800,           // 7 days in seconds
  transaction: {
    address: 'EQ...',
    amount: '7100000000',
    payload: 'base64...'
  },
  createdAt: 2024-11-09T10:30:00.000Z
}
```

**Cleanup:**
- Transactions older than 1 hour are auto-deleted
- Cleanup runs every 30 minutes

---

## 🚀 Deploy to Production

### **Option 1: VPS with PM2**

```bash
# SSH to server
ssh user@your-vps

# Clone repo
git clone your-repo
cd rental-bot

# Install dependencies
npm install

# Install PM2
npm install -g pm2

# Create ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rental-bot',
    script: 'bot.js',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TON_CONTRACT_ADDRESS: process.env.TON_CONTRACT_ADDRESS,
      TON_NETWORK: 'mainnet'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Start bot
pm2 start ecosystem.config.js

# Auto-restart on reboot
pm2 startup
pm2 save
```

### **Option 2: Docker**

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production

CMD ["node", "bot.js"]
```

Build and run:
```bash
docker build -t rental-bot .
docker run -e TELEGRAM_BOT_TOKEN=xxx -e TON_CONTRACT_ADDRESS=yyy rental-bot
```

### **Option 3: Heroku**

```bash
heroku login
heroku create your-rental-bot
heroku config:set TELEGRAM_BOT_TOKEN=xxx
heroku config:set TON_CONTRACT_ADDRESS=yyy
heroku config:set TON_NETWORK=mainnet
git push heroku main
```

---

## 📚 API Reference

### **TONConnectService Methods**

```javascript
// Create rent transaction
tonService.createRentTransaction(itemId, owner, price, deposit, duration)

// Create return transaction
tonService.createReturnTransaction(itemId)

// Create dispute transaction
tonService.createDisputeTransaction(itemId, reason)

// Get rental details from contract
await tonService.getRentalDetails(itemId)
```

### **Bot Events**

```javascript
// User clicked button
bot.on('callbackQuery', (query) => {
  console.log(query.data); // Button callback data
});

// User sent message
bot.on('text', (msg) => {
  console.log(msg.text); // Message content
});

// Bot error
bot.on('error', (error) => {
  console.error(error);
});
```

---

## 🔐 Security Best Practices

✅ **DO:**
- Use environment variables for secrets
- Validate all user input
- Use HTTPS in production
- Keep dependencies updated
- Monitor transaction logs

❌ **DON'T:**
- Hardcode private keys/tokens
- Skip input validation
- Use HTTP in production
- Store sensitive data in code
- Use outdated package versions

---

## 📞 Support & Links

- **TON Documentation:** https://ton.org/docs
- **TON Connect:** https://ton.org/docs/#/ton-connect
- **TeleBot.js:** https://github.com/mullwar/telebot
- **TON Testnet Console:** https://testnet.tonconsole.com
- **TON Explorer:** https://tonscan.org

---

## ✨ Next Steps

1. ✅ Bot with TON Connect set up
2. 📱 Test all rental flows in Telegram
3. 🌐 Deploy to your server
4. 💰 Switch to mainnet
5. 🎉 Launch to users!

**Your bot is ready! 🚀**
