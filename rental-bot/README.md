# 🤖 TON Rental Marketplace Telegram Bot

**Fully integrated with TON Connect for secure wallet-based payments**

---

## 📋 Quick Overview

```
User → Telegram Bot → TON Connect → Smart Contract → Blockchain
```

Your bot provides a complete Telegram interface for:
- 🏪 **Rent Items** - Create rentals with TON payments
- 📦 **View Rentals** - Track active rentals
- 🔙 **Return Items** - Return with automatic deposit refunds
- ⚠️ **Report Issues** - Dispute resolution system

---

## 🚀 Getting Started (2 minutes)

### 1. **Setup Environment**

```bash
# Copy template (if not exists)
cp .env.example .env

# Edit .env with your values:
TELEGRAM_BOT_TOKEN=your_bot_token
TON_CONTRACT_ADDRESS=your_contract_address
OWNER_WALLET_ADDRESS=your_wallet_address
TON_NETWORK=testnet
```

### 2. **Install & Run**

```bash
# Install dependencies
npm install

# Run bot
npm start
# or
node bot.js
```

### 3. **Test in Telegram**

- Open Telegram
- Search for your bot
- Send `/start`
- Click buttons to test!

---

## 📁 Project Structure

```
rental-bot/
├── bot.js                      # Main bot file with TON Connect
├── tonConnectService.js        # TON Connect integration
├── package.json                # Dependencies
├── .env                        # Configuration
├── TON_CONNECT_SETUP.md        # Detailed setup guide
└── README.md                   # This file
```

---

## 🔧 Files Explained

### **bot.js** (Main Bot)
- Handles all Telegram interactions
- Manages user sessions
- Integrates TON Connect service
- Creates transaction deep links
- Tracks pending transactions

**Key functions:**
```javascript
// Create rent transaction with TON Connect
handleRentFlow(chatId, input, session)

// Create return transaction
handleReturnFlow(chatId, input, session)

// Create dispute transaction
handleDisputeFlow(chatId, input, session)

// Generate payment link
generateTONDeepLink(transaction)
```

### **tonConnectService.js** (TON Integration)
- Creates blockchain transactions
- Handles operation codes
- Encodes transaction payloads

**Key methods:**
```javascript
createRentTransaction(itemId, owner, price, deposit, duration)
createReturnTransaction(itemId)
createDisputeTransaction(itemId, reason)
getRentalDetails(itemId)
```

---

## 💳 How It Works

### **User Flow Example: Renting an Item**

```
1. User: /start
   Bot: Shows main menu

2. User: Clicks "🏪 Rent Item"
   Bot: Asks for item ID

3. User: Enters "1"
   Bot: Asks for rental price

4. User: Enters "2"
   Bot: Asks for deposit

5. User: Enters "5"
   Bot: Asks for duration

6. User: Enters "7"
   Bot: Shows summary with payment button

7. User: Clicks "💳 Pay with TON Wallet"
   Bot: Opens user's TON wallet app

8. User: Reviews transaction and signs
   Wallet: Sends payment to contract

9. Contract: Processes rental
   Bot: Confirms rental started
```

### **Transaction Details**

**What gets sent:**
```
Destination: Your Smart Contract
Amount: Price + Deposit + 0.1 TON (gas)
Data: Encoded operation code + rental details
```

**What contract receives:**
```
Operation: 0x1 (rentItem)
Item ID: 1
Owner: Your wallet
Price: 2 TON
Deposit: 5 TON
Duration: 604800 seconds (7 days)
```

---

## ⚙️ Configuration

### **.env File**

```env
# Required
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklmnoPQRstUvwxyzABCDEFG
TON_CONTRACT_ADDRESS=EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_
OWNER_WALLET_ADDRESS=0QAqv6IeWdbl1aCWHAA4aCOFpSY5sxhhsB5C82WvoLrf8AFa

# Optional
TON_NETWORK=testnet         # testnet or mainnet
PORT=3000                   # For webhook mode
WEBHOOK_URL=https://...     # For production
```

### **Network Modes**

**Testnet (Development)**
```env
TON_NETWORK=testnet
```
- For testing
- Free tokens available
- No real money involved

**Mainnet (Production)**
```env
TON_NETWORK=mainnet
```
- Real transactions
- Real money
- Higher security

---

## 🧪 Testing

### **Step 1: Get Testnet Tokens**

```bash
# Visit testnet console
https://testnet.tonconsole.com

# Or use faucet
https://testnet-faucet.toncenter.com
```

### **Step 2: Test Rental Flow**

In Telegram:
```
/start
→ Click "🏪 Rent Item"
→ Item ID: 1
→ Price: 0.1
→ Deposit: 0.1
→ Duration: 1
→ Click "💳 Pay with TON Wallet"
→ Open Tonkeeper/OpenMask
→ Sign and pay
```

### **Step 3: Verify Transaction**

```bash
# Check on testnet explorer
https://testnet.tonscan.org

# Search your wallet address
# Should see transaction confirmed
```

---

## 🛠️ Commands

### **User Commands**

| Command | Action |
|---------|--------|
| `/start` | Show main menu |
| `/help` | Show help message |
| `/status` | Show bot status |

### **Button Actions**

| Button | Action |
|--------|--------|
| 🏪 Rent Item | Start rental creation |
| 📦 My Rentals | View active rentals |
| 🔙 Return Item | Start return process |
| ⚠️ Report Issue | Report dispute |
| ❓ Help | Show help menu |

---

## 📊 Transaction Types

### **1. Rent Item (0x1)**
- Amount: Price + Deposit + 0.1 TON
- Gas: ~0.1 TON
- Purpose: Create new rental

### **2. Return Item (0x2)**
- Amount: 0.05 TON (gas)
- Purpose: Mark item as returned
- Effect: Triggers deposit refund

### **3. Report Dispute (0x3)**
- Amount: 0.05 TON (gas)
- Purpose: Report rental issue
- Effect: Notifies owner

---

## 🔐 Security Features

✅ **User Safety:**
- No private keys shared with bot
- User signs all transactions
- Wallet validates every payment
- Funds held in smart contract

✅ **Data Protection:**
- Sessions cleared after timeout
- No sensitive data stored
- Transactions auto-cleanup
- Error logs don't expose secrets

---

## ❌ Troubleshooting

### **Bot not starting?**

```bash
# Check error
node bot.js

# Common issues:
# ❌ TELEGRAM_BOT_TOKEN not set
#    → Set in .env file

# ❌ TON_CONTRACT_ADDRESS missing
#    → Set in .env file

# ❌ Dependencies not installed
#    → Run: npm install
```

### **Wallet won't open?**

```
❌ Deep link not working

Solutions:
1. Update your wallet app
2. Try different wallet (Tonkeeper, OpenMask, MyTonWallet)
3. Restart phone/browser
4. Check internet connection
5. Reinstall wallet app
```

### **Transaction fails?**

```
❌ Payment rejected

Check:
1. Enough TON balance
2. Wallet connected to correct network
3. Contract address valid
4. Gas fees included
5. Network connection stable
```

### **View debug logs?**

```bash
# Run with debug
DEBUG=* node bot.js

# Or check logs
cat logs/bot.log
```

---

## 📱 Supported Wallets

- ✅ **Tonkeeper** - iOS, Android
- ✅ **OpenMask** - Chrome, Firefox
- ✅ **MyTonWallet** - Web
- ✅ **TonHub** - iOS, Android
- ✅ **Ledger** - Hardware
- ✅ **Coinbase Wallet** - Multi-chain

All wallets support deep linking and transaction signing.

---

## 🚀 Deployment

### **Option 1: Local Development**

```bash
node bot.js
```

### **Option 2: PM2 (Recommended)**

```bash
npm install -g pm2
pm2 start bot.js --name "rental-bot"
pm2 startup
pm2 save
```

### **Option 3: Docker**

```bash
docker build -t rental-bot .
docker run -e TELEGRAM_BOT_TOKEN=xxx rental-bot
```

### **Option 4: Cloud (Heroku)**

```bash
heroku create your-rental-bot
heroku config:set TELEGRAM_BOT_TOKEN=xxx
git push heroku main
```

---

## 📚 API Reference

### **TONConnectService**

```javascript
const tonService = require('./tonConnectService');

// Create transactions
const rentTx = tonService.createRentTransaction(1, owner, 2, 5, 604800);
const returnTx = tonService.createReturnTransaction(1);
const disputeTx = tonService.createDisputeTransaction(1, "Damaged");

// Get contract data
const details = await tonService.getRentalDetails(1);
```

### **Bot Methods**

```javascript
bot.on('text', (msg) => { });          // Text message
bot.on('callbackQuery', (query) => {}); // Button click
bot.on('error', (error) => {});        // Error handler

bot.sendMessage(chatId, text);         // Send message
bot.editMessageText(chatId, msgId, text); // Edit message
bot.sendPhoto(chatId, url, options);   // Send image
```

---

## 🎯 Next Steps

1. ✅ Bot deployed and running
2. 📱 Test all features in Telegram
3. 💰 Switch to mainnet when ready
4. 👥 Invite users to test
5. 📊 Monitor transactions
6. 🔧 Add more features (UI improvements, analytics, etc)

---

## 📞 Support

- **TON Docs:** https://ton.org/docs
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **TON Connect:** https://ton.org/docs/#/ton-connect
- **Community:** https://t.me/ton

---

## 📝 License

This project is open source and available under MIT License.

---

**Your Telegram bot is ready to handle TON transactions! 🚀**

For detailed setup instructions, see `TON_CONNECT_SETUP.md`
