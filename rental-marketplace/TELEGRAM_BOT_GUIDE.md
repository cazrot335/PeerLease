# 📱 TON Rental Marketplace - Telegram Bot Integration Guide

## 🎯 Overview

This guide shows you how to create a Telegram bot that integrates with your TON rental marketplace smart contract.

---

## 📋 Prerequisites

Before starting, you need:
- ✅ TON Rental Marketplace contract (you have this!)
- ✅ Node.js v16+
- ✅ Telegram Bot Token (from @BotFather)
- ✅ TON wallet for testing
- ✅ Basic knowledge of Telegram Bot API

---

## 🚀 Step 1: Create Telegram Bot

### 1a. Get Bot Token from @BotFather

1. Open Telegram and search for **@BotFather**
2. Send `/start`
3. Send `/newbot`
4. Follow instructions:
   - Enter bot name: `RentalMarketplaceBot`
   - Enter bot username: `rental_marketplace_bot` (must be unique)
5. **Save your bot token** (looks like: `123456789:ABCdefGHIjklmnoPQRstUvwxyzABCDEFG`)

### 1b. Enable Inline Mode (Optional)

```
Send to @BotFather: /setinline
Select your bot
Enter inline mode results
```

---

## 💻 Step 2: Create Telegram Bot Project

### 2a. Create New Directory

```bash
mkdir rental-bot
cd rental-bot
npm init -y
```

### 2b. Install Dependencies

```bash
npm install telebot
npm install axios
npm install dotenv
npm install @ton/ton
npm install @ton/core
```

### 2c. Create Environment File

Create `.env`:
```
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TON_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
TON_NETWORK=testnet
OWNER_WALLET_ADDRESS=YOUR_WALLET_ADDRESS
```

---

## 🤖 Step 3: Build Basic Bot Structure

### 3a. Create Main Bot File

Create `bot.js`:

```javascript
require('dotenv').config();
const TeleBot = require('telebot');
const axios = require('axios');
const { Address, beginCell } = require('@ton/core');

// Initialize bot
const bot = new TeleBot({
  token: process.env.TELEGRAM_BOT_TOKEN,
  polling: { interval: 300, timeout: 0 }
});

// Store for user sessions
const userSessions = {};

// Start command
bot.on('/start', (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, `
🏪 Welcome to TON Rental Marketplace!

What would you like to do?
  
/rent - Rent an item
/myrentals - View my rentals
/return - Return a rented item
/dispute - Report a dispute
/help - Show help
  `, {
    markup: bot.inlineKeyboard([
      [bot.inlineButton('📋 Rent Item', { callback: 'start_rent' })],
      [bot.inlineButton('📦 My Rentals', { callback: 'view_rentals' })],
      [bot.inlineButton('🔙 Return Item', { callback: 'start_return' })],
      [bot.inlineButton('⚠️ Report Dispute', { callback: 'start_dispute' })]
    ])
  });
});

// Help command
bot.on('/help', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `
📖 Help Guide

Available Commands:
/start - Start the bot
/rent - Create a new rental
/myrentals - View your active rentals
/return - Return a rented item
/dispute - Report a dispute

How to Rent:
1. Click "Rent Item" button
2. Enter item details
3. Confirm transaction
4. Wait for confirmation

How to Return:
1. Click "Return Item" button
2. Select rental
3. Confirm return
4. Funds released automatically

How to Dispute:
1. Click "Report Dispute" button
2. Select rental
3. Describe issue
4. Owner will review and resolve
  `);
});

// Handle callback buttons
bot.on('callbackQuery', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'start_rent') {
    userSessions[chatId] = { action: 'rent', step: 1 };
    bot.sendMessage(chatId, '📋 Enter Item ID (number):');
  }
  
  if (data === 'view_rentals') {
    handleViewRentals(chatId);
  }
  
  if (data === 'start_return') {
    userSessions[chatId] = { action: 'return', step: 1 };
    bot.sendMessage(chatId, '📦 Enter Rental Item ID:');
  }
  
  if (data === 'start_dispute') {
    userSessions[chatId] = { action: 'dispute', step: 1 };
    bot.sendMessage(chatId, '⚠️ Enter Rental Item ID with dispute:');
  }

  bot.answerCallbackQuery(query.id);
});

// Handle text messages
bot.on('text', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const session = userSessions[chatId];

  if (!session) return;

  try {
    if (session.action === 'rent') {
      await handleRentFlow(chatId, text, session);
    }
    
    if (session.action === 'return') {
      await handleReturnFlow(chatId, text, session);
    }
    
    if (session.action === 'dispute') {
      await handleDisputeFlow(chatId, text, session);
    }
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// Rent flow handler
async function handleRentFlow(chatId, input, session) {
  if (session.step === 1) {
    session.itemId = parseInt(input);
    session.step = 2;
    bot.sendMessage(chatId, '💰 Enter rental price (in TON):');
  } 
  else if (session.step === 2) {
    session.price = parseFloat(input);
    session.step = 3;
    bot.sendMessage(chatId, '🏠 Enter deposit amount (in TON):');
  }
  else if (session.step === 3) {
    session.deposit = parseFloat(input);
    session.step = 4;
    bot.sendMessage(chatId, '📅 Enter rental duration (in days):');
  }
  else if (session.step === 4) {
    session.duration = parseInt(input) * 24 * 60 * 60; // Convert to seconds
    
    // Show summary
    bot.sendMessage(chatId, `
✅ Rental Summary:

Item ID: ${session.itemId}
Price: ${session.price} TON
Deposit: ${session.deposit} TON
Duration: ${input} days

🔐 Connect your wallet to confirm transaction
    `, {
      markup: bot.inlineKeyboard([
        [bot.inlineButton('💳 Pay with TON Connect', { callback: 'confirm_rent' })]
      ])
    });
    
    delete userSessions[chatId];
  }
}

// Return flow handler
async function handleReturnFlow(chatId, input, session) {
  if (session.step === 1) {
    const itemId = parseInt(input);
    
    bot.sendMessage(chatId, `
🔄 Returning Item ${itemId}...

Processing return transaction...
    `, {
      markup: bot.inlineKeyboard([
        [bot.inlineButton('💳 Confirm Return', { callback: 'confirm_return' })]
      ])
    });
    
    delete userSessions[chatId];
  }
}

// Dispute flow handler
async function handleDisputeFlow(chatId, input, session) {
  if (session.step === 1) {
    session.itemId = parseInt(input);
    session.step = 2;
    bot.sendMessage(chatId, '📝 Describe the issue:');
  }
  else if (session.step === 2) {
    const reason = input;
    
    bot.sendMessage(chatId, `
📢 Dispute Reported for Item ${session.itemId}

Issue: ${reason}

Owner will review and resolve within 24 hours.
    `);
    
    // Notify owner
    const ownerChatId = 'OWNER_CHAT_ID'; // Set this
    bot.sendMessage(ownerChatId, `
⚠️ New Dispute Report

Item: ${session.itemId}
Issue: ${reason}
Renter: ${chatId}

/resolve_${session.itemId} - To resolve this dispute
    `);
    
    delete userSessions[chatId];
  }
}

// View rentals handler
async function handleViewRentals(chatId) {
  bot.sendMessage(chatId, `
📦 Your Active Rentals

(Loading from contract...)

Item 1: Bike
- Price: 2 TON
- Deposit: 5 TON
- Days left: 4 days
- Status: Active ✓

Item 2: Book
- Price: 0.5 TON
- Deposit: 1 TON
- Days left: 2 days
- Status: Active ✓
  `, {
    markup: bot.inlineKeyboard([
      [bot.inlineButton('🔙 Return Item 1', { callback: 'return_item_1' })],
      [bot.inlineButton('🔙 Return Item 2', { callback: 'return_item_2' })]
    ])
  });
}

// Start bot
bot.start();
console.log('✅ Bot is running...');
```

### 3b. Run the Bot

```bash
node bot.js
```

---

## 🔗 Step 4: Integrate TON Connect (Wallet Connection)

### 4a. Create TON Connect Integration

Create `tonConnectService.js`:

```javascript
const axios = require('axios');
const { Address, beginCell, toNano } = require('@ton/core');

class TONConnectService {
  constructor(contractAddress, network = 'testnet') {
    this.contractAddress = contractAddress;
    this.network = network;
    this.apiBase = network === 'testnet' 
      ? 'https://testnet.toncenter.com/api/v2'
      : 'https://toncenter.com/api/v2';
  }

  /**
   * Create rent item transaction
   */
  createRentTransaction(itemId, ownerAddress, price, deposit, duration) {
    const body = beginCell()
      .storeUint(0x1, 32)           // Operation: rentItem
      .storeUint(itemId, 64)        // Item ID
      .storeAddress(ownerAddress)   // Owner address
      .storeCoins(toNano(price))    // Price
      .storeCoins(toNano(deposit))  // Deposit
      .storeUint(duration, 32)      // Duration
      .endCell();

    return {
      address: this.contractAddress,
      amount: toNano(price + deposit + 0.1).toString(), // Price + deposit + gas
      payload: body.toBoc().toString('base64')
    };
  }

  /**
   * Create return item transaction
   */
  createReturnTransaction(itemId) {
    const body = beginCell()
      .storeUint(0x2, 32)           // Operation: returnItem
      .storeUint(itemId, 64)        // Item ID
      .endCell();

    return {
      address: this.contractAddress,
      amount: toNano(0.05).toString(), // Gas fee
      payload: body.toBoc().toString('base64')
    };
  }

  /**
   * Create dispute transaction
   */
  createDisputeTransaction(itemId, reason) {
    const body = beginCell()
      .storeUint(0x3, 32)           // Operation: reportDispute
      .storeUint(itemId, 64)        // Item ID
      .storeUint(reason.length, 32) // Reason length
      .storeBuffer(Buffer.from(reason))
      .endCell();

    return {
      address: this.contractAddress,
      amount: toNano(0.05).toString(),
      payload: body.toBoc().toString('base64')
    };
  }

  /**
   * Get rental details
   */
  async getRentalDetails(itemId) {
    try {
      const response = await axios.get(
        `${this.apiBase}/runGetMethod`,
        {
          params: {
            address: this.contractAddress,
            method: 'getRentalDetails',
            stack: [[{ 'type': 'num', 'number': itemId }]]
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting rental details:', error);
      return null;
    }
  }
}

module.exports = TONConnectService;
```

### 4b. Add TON Connect to Bot

Update `bot.js`:

```javascript
const TONConnectService = require('./tonConnectService');

// Initialize TON Connect service
const tonService = new TONConnectService(
  process.env.TON_CONTRACT_ADDRESS,
  process.env.TON_NETWORK
);

// Add to callback handler
bot.on('callbackQuery', async (query) => {
  // ... existing code ...
  
  if (query.data === 'confirm_rent') {
    const session = userSessions[query.message.chat.id];
    
    const transaction = tonService.createRentTransaction(
      session.itemId,
      process.env.OWNER_WALLET_ADDRESS,
      session.price,
      session.deposit,
      session.duration
    );
    
    // Send transaction link to user
    const tonConnectLink = `ton://transfer/${transaction.address}?amount=${transaction.amount}&text=Rent%20Item%20${session.itemId}`;
    
    bot.sendMessage(query.message.chat.id, `
💳 Pay with TON

Click the button below to pay with your TON wallet:
    `, {
      markup: bot.inlineKeyboard([
        [bot.inlineButton('💰 Pay Now', { url: tonConnectLink })]
      ])
    });
  }
});
```

---

## 📱 Step 5: Deploy Bot to Server

### 5a. Create deployment files

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "bot.js"]
```

Create `.dockerignore`:
```
node_modules
.env
.git
```

### 5b. Deploy to Heroku (Free Option)

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-rental-bot

# Set environment variables
heroku config:set TELEGRAM_BOT_TOKEN=YOUR_TOKEN
heroku config:set TON_CONTRACT_ADDRESS=YOUR_CONTRACT

# Deploy
git push heroku main
```

### 5c. Deploy to VPS (Better Option)

```bash
# SSH to your server
ssh user@your-vps

# Clone repository
git clone your-repo

# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start bot.js --name "rental-bot"

# Setup auto-restart
pm2 startup
pm2 save
```

---

## 🎮 Step 6: Bot Commands Reference

### User Commands

```
/start              - Start the bot
/rent               - Create new rental
/myrentals          - View active rentals
/return             - Return a rental item
/dispute            - Report a dispute
/help               - Show help message
/status             - Check bot status
/settings           - User settings
```

### Admin Commands

```
/admin              - Admin panel
/stats              - View statistics
/users              - List users
/disputes           - View pending disputes
/resolve_[id]       - Resolve dispute by ID
/refund_[user]      - Issue refund
```

---

## 🔍 Step 7: Advanced Features

### 7a. Webhook Setup (Better than Polling)

Create `webhook.js`:

```javascript
require('dotenv').config();
const express = require('express');
const TeleBot = require('telebot');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const bot = new TeleBot({
  token: process.env.TELEGRAM_BOT_TOKEN,
  webhook: {
    key: null,
    cert: null,
    url: process.env.WEBHOOK_URL
  }
});

// Webhook endpoint
app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Register webhook
bot.setWebHook({
  url: process.env.WEBHOOK_URL,
  certificate: null
});

app.listen(process.env.PORT || 3000, () => {
  console.log('✅ Webhook server running');
});
```

### 7b. Database for User Data

Create `db.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      telegram_id TEXT UNIQUE,
      wallet_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS rentals (
      id INTEGER PRIMARY KEY,
      item_id INTEGER,
      renter_id TEXT,
      owner_id TEXT,
      price REAL,
      deposit REAL,
      start_time INTEGER,
      end_time INTEGER,
      status TEXT DEFAULT 'active'
    )
  `);
});

module.exports = db;
```

### 7c. Payment Processing

Create `paymentService.js`:

```javascript
const axios = require('axios');

class PaymentService {
  async verifyPayment(transactionHash) {
    try {
      const response = await axios.get(
        `https://testnet.toncenter.com/api/v2/getTransactionData?tx_hash=${transactionHash}`
      );
      
      if (response.data.ok) {
        return {
          confirmed: true,
          data: response.data.result
        };
      }
      
      return { confirmed: false };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { confirmed: false };
    }
  }

  async checkBalance(address) {
    try {
      const response = await axios.get(
        `https://testnet.toncenter.com/api/v2/getAddressBalance?address=${address}`
      );
      
      return response.data.result;
    } catch (error) {
      console.error('Error checking balance:', error);
      return null;
    }
  }
}

module.exports = new PaymentService();
```

---

## 📊 Step 8: Complete Example Bot

Here's a complete minimal working bot:

Create `complete-bot.js`:

```javascript
require('dotenv').config();
const TeleBot = require('telebot');

const bot = new TeleBot({
  token: process.env.TELEGRAM_BOT_TOKEN,
  polling: { interval: 300, timeout: 0 }
});

// Main menu
const mainMenu = bot.inlineKeyboard([
  [bot.inlineButton('🏪 Browse Items', { callback: 'browse' })],
  [bot.inlineButton('📦 My Rentals', { callback: 'my_rentals' })],
  [bot.inlineButton('⚙️ Settings', { callback: 'settings' })]
]);

// Start
bot.on('/start', (msg) => {
  bot.sendMessage(msg.chat.id, `
🏪 Welcome to TON Rental Marketplace!

Browse items, rent anything you need, and pay securely with TON.
  `, { markup: mainMenu });
});

// Callbacks
bot.on('callbackQuery', (query) => {
  if (query.data === 'browse') {
    bot.sendMessage(query.message.chat.id, `
📋 Available Items:

1️⃣ Bike - 2 TON/week
2️⃣ Book - 0.5 TON/week
3️⃣ Laptop - 5 TON/week
    `);
  }
  
  if (query.data === 'my_rentals') {
    bot.sendMessage(query.message.chat.id, `
📦 You have no active rentals.

Visit /browse to rent something!
    `);
  }
  
  bot.answerCallbackQuery(query.id);
});

bot.start();
console.log('✅ Bot running!');
```

---

## 🚀 Step 9: Test Your Bot

### Test Commands

```bash
# Send message to bot
/start

# Try renting
Click "Rent Item"
Enter item ID: 1
Enter price: 2
Enter deposit: 5
Enter duration: 7

# Try returning
Click "Return Item"
Enter item ID: 1

# Try dispute
Click "Report Dispute"
Enter item ID: 1
Enter reason: "Item damaged"
```

### Check Bot Status

```bash
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
```

---

## 📱 Step 10: Mini App Integration (Advanced)

Create `miniapp.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Rental Marketplace</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
  <div id="app">
    <h1>🏪 Rental Marketplace</h1>
    
    <button onclick="rentItem()">Rent Item</button>
    <button onclick="viewRentals()">My Rentals</button>
    <button onclick="returnItem()">Return Item</button>
  </div>

  <script>
    let tg = window.Telegram.WebApp;
    tg.ready();

    function rentItem() {
      tg.sendData(JSON.stringify({ action: 'rent' }));
    }

    function viewRentals() {
      tg.sendData(JSON.stringify({ action: 'view' }));
    }

    function returnItem() {
      tg.sendData(JSON.stringify({ action: 'return' }));
    }
  </script>
</body>
</html>
```

---

## ✅ Quick Start Summary

```bash
# 1. Create bot project
mkdir rental-bot && cd rental-bot
npm init -y

# 2. Install dependencies
npm install telebot axios dotenv @ton/ton @ton/core

# 3. Create bot.js with code from Step 3

# 4. Create .env file with tokens

# 5. Run bot
node bot.js

# 6. Test in Telegram
# Find your bot and send /start
```

---

## 🔗 Useful Links

- **Telegram Bot API**: https://core.telegram.org/bots/api
- **TON Connect Docs**: https://ton.org/docs/#/ton-connect
- **TeleBot.js**: https://github.com/mullwar/telebot
- **TON Core**: https://github.com/ton-org/ton
- **Telegram Mini Apps**: https://core.telegram.org/bots/webapps

---

## 🐛 Troubleshooting

### Bot not responding
```
Check:
1. Bot token is correct
2. Bot is running (node bot.js)
3. Network connection works
4. No firewall blocking
```

### Webhook not working
```
Check:
1. WEBHOOK_URL is correct
2. SSL certificate valid
3. Domain DNS configured
4. Port 443 open
```

### Payment not confirming
```
Check:
1. TON on testnet/mainnet
2. Contract address correct
3. Transaction format valid
4. Explorer shows transaction
```

---

## 🎯 Next Steps

1. ✅ Create Telegram bot
2. ✅ Deploy to server
3. ✅ Add TON Connect integration
4. ✅ Setup webhook
5. ✅ Add database
6. ✅ Create Mini App
7. ✅ Launch public
8. ✅ Add more features

**Your bot is ready to go live! 🚀**

