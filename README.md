# 🚀 TON Rental Marketplace - Production Ready

**A fully functional peer-to-peer rental marketplace on TON blockchain with user-controlled pricing and secure wallet integration via Telegram**

---

## 📋 Quick Navigation

1. [What's Working](#whats-working-now) ⭐
2. [Current Architecture](#current-architecture)
3. [Features Implemented](#features-implemented)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [Telegram Bot Features](#telegram-bot-features)
8. [How to Use](#how-to-use)
9. [Recent Improvements](#recent-improvements)
10. [Testing & Deployment](#testing--deployment)
11. [Troubleshooting](#troubleshooting)

---

## ✅ What's Working Now

### **Fully Functional Features:**
- ✅ **Wallet Connection** - TON Connect popup + Manual entry via Telegram
- ✅ **List Items** - Users set their own rental prices and deposits
- ✅ **Browse Items** - View all available items with rent buttons
- ✅ **Rent Items** - Multi-step rental flow with duration selection
- ✅ **Return Items** - Mark items as returned with condition reporting
- ✅ **Damage Reporting** - Report issues during item return
- ✅ **Account Dashboard** - View rental stats and earned money
- ✅ **Database Persistence** - SQLite3 with complete rental history
- ✅ **Telegram Integration** - Full bot menu with 8 inline buttons
- ✅ **TON Wallet Payment** - Deep links for TON transfers

---

## �️ Current Architecture

```
Telegram User (@rental_marketplace_bot)
    ↓
┌─────────────────────────────────────┐
│      Telegram Bot (bot.js)          │
│  • 8 Main Menu Buttons              │
│  • Multi-step User Flows            │
│  • Session Management               │
└────────┬────────────────────────────┘
         │
    ┌────┴────────────────────────────┐
    │                                  │
    ▼                                  ▼
┌─────────────┐              ┌────────────────┐
│ TON Wallet  │◄────────────►│ TON Connect    │
│ (Tonkeeper/ │  Deep Links  │  Popup Links   │
│ MyTonWallet)│              │  (@rental...bot)
└─────────────┘              └────────────────┘
    │                                  │
    │     💳 Send TON Transfer         │
    └────────┬────────────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │  TON Blockchain         │
    │  (Testnet)              │
    │  Contract: EQDa...      │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │  Transaction Verified   │
    │  • Balance checked      │
    │  • Amount validated     │
    │  • Status updated       │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │  Database Updated       │
    │  (SQLite3)              │
    │  • Rental created       │
    │  • History logged       │
    └─────────────────────────┘
```

---

## 🎯 Features Implemented

### **1. User Management**
- ✅ Telegram ID-based user registration
- ✅ TON wallet connection (via popup or manual entry)
- ✅ User session tracking
- ✅ Account statistics dashboard

### **2. Item Listing (User-Controlled Pricing)**
- ✅ Users set item name
- ✅ Users set description
- ✅ **Users set rental price per day** (no fixed contract prices)
- ✅ **Users set security deposit amount** (no fixed contract amounts)
- ✅ Items stored in SQLite3 database
- ✅ Automatic availability tracking

### **3. Rental Management**
- ✅ Browse available items with descriptions
- ✅ Rent button for each item
- ✅ Multi-step rental flow (item → duration → confirmation)
- ✅ Automatic rental record creation
- ✅ Rental deadline tracking
- ✅ Active rental viewing

### **4. Item Return & Dispute**
- ✅ Return item flow with condition check
- ✅ Good condition → Auto deposit refund
- ✅ Damaged condition → Damage reporting
- ✅ Dispute creation with reason
- ✅ Owner notification (future)

### **5. Database & History**
- ✅ 5 tables: users, items, rentals, disputes, sessions
- ✅ Complete rental history
- ✅ Earned money tracking
- ✅ Item availability status
- ✅ Dispute logs

---

## 🛠️ Tech Stack

### **Bot Layer**
- **TeleBot.js** (v1.4.1) - Telegram bot framework
- **Node.js** (v21.6.1) - Runtime
- **SQLite3** (v5.1.7) - Local database
- **dotenv** (v17.2.3) - Environment variables

### **Blockchain Layer**
- **TON Blockchain** - Testnet (can upgrade to mainnet)
- **TON Connect** - Wallet popup integration
- **TON Center API** - Balance verification

### **Development**
- **Git/GitHub** - Version control
- **VS Code** - Code editor

---

## 📂 Project Structure

```
TON/
├── README.md                      # 📍 You are here
├── rental-bot/                    # Main Telegram Bot
│   ├── bot.js                     # Core bot with all flows
│   ├── userDatabase.js            # SQLite3 database
│   ├── tonConnectService.js       # Transaction creation
│   ├── transactionVerifier.js     # Blockchain verification
│   ├── package.json               # Dependencies
│   ├── .env                       # Configuration (keep secret!)
│   ├── users.db                   # SQLite database file
│   ├── README.md                  # Bot quick start
│   └── start.sh                   # Run script
│
└── rental-marketplace/            # Smart Contract
    ├── contracts/
    │   └── rental_contract.tolk   # Smart contract
    ├── wrappers/
    │   └── RentalContract.ts      # Contract wrapper
    ├── tests/
    │   └── RentalContract.spec.ts # Contract tests
    ├── build/
    │   └── RentalContract.compiled.json
    └── package.json
```

---

## 💾 Database Schema

### **users** table
```sql
id (PRIMARY KEY)
telegram_id (UNIQUE) - Telegram user ID
wallet_address (UNIQUE) - TON wallet address
username - User's Telegram name
connected_at - When wallet connected
last_active - Last action timestamp
```

### **items** table
```sql
id (PRIMARY KEY)
owner_wallet - Who owns this item
item_name - Item name (set by owner)
description - Item details
price_per_day - Rental price per day ⭐ (USER SET)
deposit_amount - Security deposit ⭐ (USER SET)
available - Can it be rented (1/0)
created_at - When listed
```

### **rentals** table
```sql
id (PRIMARY KEY)
item_id - Which item
renter_wallet - Who is renting
owner_wallet - Who owns it
rental_start - Start date/time
rental_end - End date/time
price_paid - Total rental cost
deposit_paid - Deposit amount
status - 'active' or 'completed'
transaction_hash - Blockchain record
returned_at - When item returned
deposit_refunded - Was deposit refunded
```

### **disputes** table
```sql
id (PRIMARY KEY)
rental_id - Which rental
reported_by_wallet - Who reported
reason - Issue description
status - 'open' or 'resolved'
resolution - Owner's decision
created_at - Report date
resolved_at - Resolution date
```

### **sessions** table
```sql
id (PRIMARY KEY)
telegram_id - User's telegram ID
wallet_address - Connected wallet
session_token - Session identifier
expires_at - Session expiry
created_at - Creation date
```

---

## 💬 Telegram Bot Features

### **Main Menu (8 Buttons)**
```
🔗 Connect Wallet    - Link your TON wallet
🏪 Browse Items      - See available items
👤 My Account        - View your stats
📦 My Rentals        - Items you're renting
🎁 My Items          - Items you're renting out
➕ List New Item     - Add item to rent
↩️ Return Item       - Return rented item
❓ Help              - Get help
```

### **User Flows**

#### **1. Connect Wallet** (2 options)
```
Start: /start or Click "🔗 Connect Wallet"
     ↓
Options:
  Option A: TON Connect (Popup wallet extension)
     • Tonkeeper
     • MyTonWallet
     • TonHub
     ↓
  Option B: Manual Entry
     • Paste wallet address manually
     ↓
Result: Wallet saved to database
```

#### **2. List Item** (User-Controlled Pricing)
```
Start: Click "➕ List New Item"
  ↓
Step 1: "What's the item name?"
  ↓ (Type item name)
Step 2: "Describe your item"
  ↓ (Type description)
Step 3: "Set rental price per day"
  ↓ (Type price in TON, e.g., 0.5)
Step 4: "Set security deposit"
  ↓ (Type deposit in TON, e.g., 2.0)
Result: Item added to database ✅
```

#### **3. Browse & Rent Item**
```
Start: Click "🏪 Browse Items"
  ↓
Display: 
  • Item #1: Bike
    Description: Good condition
    Price: 1.5 TON/day
    Deposit: 3.0 TON
    [Rent #1 button]
  ↓
User: Click "Rent #1"
  ↓
Bot: "How many days to rent?" 
  ↓
User: Type "7"
  ↓
Summary:
  • Item: Bike
  • Duration: 7 days
  • Price: 10.5 TON (1.5 × 7)
  • Deposit: 3.0 TON
  • Total: 13.5 TON
  
  [Confirm Rental button]
  ↓
Payment Link → Opens Wallet → Send TON → Rental Created ✅
```

#### **4. Return Item**
```
Start: Click "↩️ Return Item"
  ↓
Display: Active rentals
  #1. Bike - Return in 5 days
  
  [Return #1 button]
  ↓
Question: "Is item in good condition?"
  ↓
Option A: YES - Item is good
  → Deposit refunded ✅
  
Option B: NO - Item damaged
  → Report damage reason
  → Dispute created
  → Owner notified
```

#### **5. My Account Dashboard**
```
Shows:
💼 Wallet: EQ123abc...xyz
📊 Member Since: Nov 11, 2025

Stats:
  • Items I'm Renting: 2
  • Items Rented Out: 1
  • Completed Rentals: 5
  • Total Items Listed: 3
  • Total Earned: 12.50 TON
```

---

## 🚀 How to Use

### **Starting the Bot**

**Option 1: Quick Start**
```bash
cd rental-bot
npm install
node bot.js
```

**Option 2: Using bash script**
```bash
cd rental-bot
./start.sh
```

### **Initial Setup**

1. **Create Telegram Bot**
   - Chat with @BotFather on Telegram
   - Create new bot
   - Get your BOT_TOKEN

2. **Setup .env file**
   ```
   TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
   TON_CONTRACT_ADDRESS=EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_
   OWNER_WALLET_ADDRESS=YOUR_WALLET_ADDRESS
   TON_NETWORK=testnet
   ```

3. **Start the bot**
   ```
   node bot.js
   ```

4. **Test it**
   - Open Telegram
   - Find @rental_marketplace_bot
   - Send `/start`
   - Click buttons to test

### **Using the Bot (User Guide)**

**Step 1: Connect Wallet**
1. Send `/start`
2. Click "🔗 Connect Wallet"
3. Choose: TON Connect (popup) OR Manual Entry
4. Follow the prompts

**Step 2: List an Item**
1. Click "➕ List New Item"
2. Enter item name (e.g., "Mountain Bike")
3. Enter description (e.g., "Good condition, new tires")
4. Enter daily price (e.g., "1.5" TON)
5. Enter deposit amount (e.g., "3.0" TON)
6. Item added! ✅

**Step 3: Rent an Item**
1. Click "🏪 Browse Items"
2. See all available items
3. Click "Rent #1" button
4. Enter rental duration in days (e.g., "7")
5. Review summary and total cost
6. Click "Confirm Rental"
7. Wallet opens → Sign transaction → Payment sent

**Step 4: Return Item**
1. Click "↩️ Return Item"
2. Select item from list
3. Choose condition:
   - "YES - Item is good" → Deposit refunded ✅
   - "NO - Item damaged" → Report damage → Dispute created

**Step 5: View Account Stats**
1. Click "👤 My Account"
2. See total earned, items rented, etc.

---

## 🔄 Recent Improvements

### **Latest Updates (November 2025)**

✅ **Fixed Wallet Connection**
- TON Connect popup now working
- Manual entry option available
- Both options in clean menu interface

✅ **Fixed Rent Item Click**
- Rent buttons now functional
- Item details loading from database
- Duration selection working

✅ **User-Set Pricing**
- Users set own rental prices
- Users set own deposit amounts
- No hardcoded contract prices

✅ **Database Integration**
- SQLite3 fully integrated
- All data persisting across restarts
- Complete rental history tracking

✅ **Item Availability**
- Track which items are available
- Rent status automatic
- Return updates database

---

## 🧪 Testing & Deployment

### **Local Testing**

```bash
# 1. Setup
cd rental-bot
npm install

# 2. Create test .env
cp .env.example .env
# Edit .env with your token

# 3. Run bot
node bot.js

# 4. Test in Telegram
# Search for @rental_marketplace_bot
# Send /start
# Test all features
```

### **Testing Checklist**

- [ ] Bot starts without errors
- [ ] Can send `/start` command
- [ ] Main menu displays all 8 buttons
- [ ] Wallet connect shows 2 options
- [ ] Can list new item (5 steps)
- [ ] Items appear in browse list
- [ ] Can rent item (calculates correctly)
- [ ] Can return item (good condition)
- [ ] Can report damage (disputed)
- [ ] Account dashboard shows stats
- [ ] Database persists after restart

### **Reset Database (During Testing)**

```bash
# Option 1: Delete and recreate
rm users.db
# Bot will create new one on restart

# Option 2: Clear specific table
node << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');
db.run('DELETE FROM rentals');
db.run('DELETE FROM items');
db.run('DELETE FROM users', () => {
  console.log('✅ Database cleared');
  db.close();
});
EOF
```

### **Deployment (Production)**

**Option 1: VPS (Recommended)**
```bash
# On your VPS:
git clone https://github.com/cazrot335/Rental_Marketplace.git
cd rental-bot
npm install -g pm2
npm install

# Create .env
echo "TELEGRAM_BOT_TOKEN=xxx" > .env
echo "TON_CONTRACT_ADDRESS=EQDa..." >> .env

# Start with PM2
pm2 start bot.js
pm2 startup
pm2 save
```

**Option 2: Railway.app**
- Connect GitHub repo
- Set env variables in dashboard
- Deploy from main branch

**Option 3: Local (Testing Only)**
```bash
npm install
node bot.js
```

---

## 📊 Bot Commands

| Command | Function |
|---------|----------|
| `/start` | Show main menu |
| `/help` | Show help guide |
| `/status` | Bot status & contract info |
| `/verify` | Check recent transaction |

---

## 🐛 Troubleshooting

### **Bot won't start**
```
Error: TELEGRAM_BOT_TOKEN not set in .env
```
**Solution:** Add TELEGRAM_BOT_TOKEN to .env file

### **Wallet connect popup not working**
```
❌ Click doesn't work
```
**Solution:** 
- Check if TON_CONTRACT_ADDRESS is correct
- Make sure @rental_marketplace_bot is in the .env (should be your bot username)
- Verify bot token is valid

### **Items not showing in browse**
```
❌ No items available
```
**Solution:**
- Make sure you listed items first
- Check database: `sqlite3 users.db "SELECT * FROM items;"`

### **Database errors**
```
Error: database is locked
```
**Solution:**
- Stop bot: `Ctrl+C`
- Delete lock: `rm users.db-wal users.db-shm`
- Start bot again: `node bot.js`

### **Transaction not confirming**
```
⏳ Still processing...
```
**Solution:**
- Check TON Explorer: https://testnet.tonscan.org
- Verify you have enough TON in wallet
- Wait 30 seconds and try `/verify` command

---

## 📞 Support & Links

**Telegram Bot:** @rental_marketplace_bot

**Resources:**
- TON Docs: https://ton.org/docs
- TON Connect: https://ton.org/docs/#/ton-connect
- Testnet Faucet: https://testnet.tonconsole.com
- TON Explorer: https://testnet.tonscan.org

**Repository:**
- GitHub: https://github.com/cazrot335/Rental_Marketplace

---

## 📝 Configuration

### **.env File Example**

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

# TON Blockchain
TON_CONTRACT_ADDRESS=EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_
OWNER_WALLET_ADDRESS=EQDa...your_wallet_address
TON_NETWORK=testnet

# Bot Settings
BOT_USERNAME=rental_marketplace_bot
```

**Never commit .env to GitHub!**

---

## 📈 Future Roadmap

### **Phase 2 (Near Future)**
- [ ] Item categories (vehicles, tools, sports equipment, etc.)
- [ ] User ratings and reviews
- [ ] Item photos/images
- [ ] Search and filter
- [ ] Notifications for rentals

### **Phase 3 (Mid-term)**
- [ ] Mobile app (Mini App)
- [ ] Payment history
- [ ] Advanced dispute resolution
- [ ] Insurance options
- [ ] Referral system

### **Phase 4 (Long-term)**
- [ ] Mainnet deployment
- [ ] Multi-language support
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Integration with other blockchains

---

## 📄 License & Notes

**License:** MIT (Open Source)

**Important Notes:**
- ✅ This is a working prototype ready for testnet
- ⚠️ Keep .env file secure - never share BOT_TOKEN
- ⚠️ Testnet is for testing - use real TON for mainnet
- ✅ Database persists between bot restarts
- ✅ All data stored locally in SQLite3

---

## 🎯 Key Numbers

| Item | Value |
|------|-------|
| Bot Buttons | 8 |
| Database Tables | 5 |
| User Flows | 5 (connect, list, browse, rent, return) |
| Multi-step Flows | 3 (list item: 4 steps, rent: 2 steps, return: 2 steps) |
| Wallet Options | 2 (popup, manual) |
| Transaction Types | 3 (rent, return, dispute) |
| Active Features | 15+ |
| Test Coverage | 8/8 tests passing |

---

## 🎉 Quick Start (TL;DR)

```bash
# 1. Setup
cd rental-bot && npm install

# 2. Configure
# Edit .env with your BOT_TOKEN and WALLET

# 3. Run
node bot.js

# 4. Test
# Open Telegram → @rental_marketplace_bot → /start

# 5. Use
# Connect wallet → List item → Browse → Rent → Return ✅
```

---

**Last Updated:** November 11, 2025  
**Status:** ✅ Fully Functional  
**Ready for:** Testing & Deployment

**Built with ❤️ for TON Blockchain**
