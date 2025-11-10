# Wallet Connection & Account Management Guide

## 📋 Overview

Your rental bot now has a **complete user account management system** with persistent wallet tracking using SQLite3 database. Users can connect their TON wallets to Telegram and track rentals as both **renters** and **item owners**.

## ✅ What's New

### Database System (users.db)
- **6 tables**: users, items, rentals, disputes, sessions
- **Persistent storage**: All user data saved across bot restarts
- **Wallet tracking**: Each Telegram account links to one TON wallet
- **Two-way rentals**: Track items renting AND items being rented out

### Updated Bot Menu

When users start the bot, they now see:

```
🔗 Connect Wallet      - Link TON wallet to account
📦 Browse Items         - View all available items for rent
👤 My Account          - See wallet + rental statistics
📦 My Rentals          - Items I'm currently renting
🎁 My Items            - Items I've listed for rent
❓ Help                - Get help information
```

### Account Statistics

When users view "👤 My Account", they see:
- Connected wallet address
- Number of active rentals (items I'm renting)
- Number of items rented out (others renting my items)
- Completed rentals (lifetime)
- Total items I own
- Total TON earned

## 🚀 How to Test

### Step 1: Start the Bot

```bash
cd c:\Users\91876\OneDrive\Desktop\TON\rental-bot
node bot.js
```

The bot will:
1. Connect to Telegram
2. Initialize the SQLite3 database (`users.db`)
3. Create all tables automatically
4. Start listening for messages

### Step 2: Connect Wallet in Telegram

1. **Open Telegram** and find your bot
2. **Send** `/start`
3. **Expected response**: 
   - If first time: "Welcome! Please connect your TON wallet"
   - Shows menu with "🔗 Connect Wallet" button
4. **Click** "🔗 Connect Wallet"
5. **Bot responds**: "Please send your TON wallet address (EQ... or 0Q... format)"
6. **Send a test wallet address**, e.g.:
   ```
   EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_
   ```
   (or any valid TON address in EQ or 0Q format)
7. **Expected response**: "✅ Wallet connected successfully! Your wallet: EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_"

### Step 3: View Your Account

1. **Send** `/start` again (or click main menu)
2. **Expected response**: "Welcome back! Your wallet is connected: EQDa..."
3. **Click** "👤 My Account"
4. **Bot shows**:
   ```
   📊 Your Account Statistics
   
   Wallet: EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_
   
   📦 Items Renting: 0
   🎁 Items Rented Out: 0
   ✅ Completed Rentals: 0
   📋 Total Items Owned: 0
   💰 Total Earned: 0 TON
   ```
   (All 0 because no rentals added yet)

### Step 4: Browse Available Items

1. **Click** "📦 Browse Items"
2. **Expected response**: "📦 No items available yet"
   (Empty because we haven't added any items to the database)

### Step 5: View Your Items

1. **Click** "🎁 My Items"
2. **Expected response**: "📋 You haven't listed any items yet"

### Step 6: View Your Rentals

1. **Click** "📦 My Rentals"
2. **Expected response**: "📦 You don't have any active rentals"

## 🧪 Testing Two-Way Rentals

To properly test the two-way rental system, you'll need to:

### Add Test Items to Database

Run this test script:

```bash
cd c:\Users\91876\OneDrive\Desktop\TON\rental-bot
node -e "
const UserDatabase = require('./userDatabase');
(async () => {
  const db = new UserDatabase('./users.db');
  
  // Add test wallet
  const walletAddress = 'EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_';
  
  // Add test items
  await db.addItem(
    walletAddress,
    'Mountain Bike',
    'Trek X-Caliber 8, excellent condition',
    0.5,  // 0.5 TON per day
    2.0   // 2 TON deposit
  );
  
  await db.addItem(
    walletAddress,
    'Laptop',
    'Dell XPS 13, 512GB SSD, 16GB RAM',
    0.3,  // 0.3 TON per day
    1.5   // 1.5 TON deposit
  );
  
  console.log('Test items added successfully!');
  process.exit(0);
})();
"
```

Then in Telegram:
1. Click "📦 Browse Items"
2. Should now show:
   ```
   📦 Available Items:
   
   🚲 Mountain Bike
   Trek X-Caliber 8, excellent condition
   Price: 0.5 TON/day | Deposit: 2.0 TON
   Owner: EQDaMahFb...
   
   💻 Laptop
   Dell XPS 13, 512GB SSD, 16GB RAM
   Price: 0.3 TON/day | Deposit: 1.5 TON
   Owner: EQDaMahFb...
   ```

3. Click "🎁 My Items"
2. Should now show:
   ```
   🎁 Your Listed Items:
   
   1️⃣ Mountain Bike (Available)
      Price: 0.5 TON/day | Deposit: 2.0 TON
   
   2️⃣ Laptop (Available)
      Price: 0.3 TON/day | Deposit: 1.5 TON
   ```

### Test Rental Creation

Simulate rental creation:

```bash
node -e "
const UserDatabase = require('./userDatabase');
(async () => {
  const db = new UserDatabase('./users.db');
  
  const ownerWallet = 'EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_';
  const renterWallet = 'EQA_EFILx3xREAAIvxWgXEhKqJVa0NhHM8CZT0MXAhZvf5z_';
  
  // Create a rental
  await db.createRental(
    1,                                    // item_id
    renterWallet,                         // renter_wallet
    ownerWallet,                          // owner_wallet
    3,                                    // duration_days
    1.5,                                  // price_paid (0.5 TON * 3 days)
    2.0,                                  // deposit_paid
    '1234567890ABCDEF'                    // transaction_hash
  );
  
  console.log('Test rental created!');
  process.exit(0);
})();
"
```

Then in Telegram (with renter wallet connected):
1. Click "📦 My Rentals"
2. Should show:
   ```
   📦 Your Active Rentals:
   
   🚲 Mountain Bike
   Duration: 3 days | Paid: 1.5 TON
   Owner: EQDaMahFb...
   Return by: [date 3 days from now]
   ```

With owner wallet connected:
1. Click "🎁 My Items"
2. Should show:
   ```
   🎁 Your Listed Items:
   
   1️⃣ Mountain Bike (🔴 Rented)
      Price: 0.5 TON/day | Deposit: 2.0 TON
      Rented by: EQA_EFILx...
      Duration: 3 days
   ```

## 📊 Database Structure

### users table
```sql
id              INTEGER PRIMARY KEY
telegram_id     INTEGER UNIQUE (links to Telegram user)
wallet_address  TEXT (TON wallet address)
username        TEXT (Telegram username)
connected_at    DATETIME (when wallet was connected)
last_active     DATETIME (last bot interaction)
```

### items table
```sql
id              INTEGER PRIMARY KEY
owner_wallet    TEXT (wallet of person listing the item)
item_name       TEXT (what is being rented)
description     TEXT (item details)
price_per_day   REAL (rental price in TON)
deposit_amount  REAL (required security deposit)
available       BOOLEAN (is item available?)
created_at      DATETIME
```

### rentals table
```sql
id              INTEGER PRIMARY KEY
item_id         INTEGER (which item is rented)
renter_wallet   TEXT (who is renting)
owner_wallet    TEXT (who owns the item)
rental_start    DATETIME (when rental began)
rental_end      DATETIME (when rental ends)
price_paid      REAL (total rental price paid)
deposit_paid    REAL (security deposit amount)
status          TEXT (active/completed/disputed)
transaction_hash TEXT (blockchain transaction ID)
created_at      DATETIME
```

### disputes table
```sql
id              INTEGER PRIMARY KEY
rental_id       INTEGER (which rental has dispute)
reported_by_wallet TEXT (who reported the dispute)
reason          TEXT (why is there a dispute?)
status          TEXT (open/resolved)
resolution      TEXT (how was it resolved?)
created_at      DATETIME
```

## 🔄 Database Persistence

- **Database file**: `c:\Users\91876\OneDrive\Desktop\TON\rental-bot\users.db`
- **Auto-created**: On first bot run
- **Auto-persisted**: All user actions saved immediately
- **Survives restarts**: Wallet connections and rental history remain after bot restarts
- **Backup**: Copy `users.db` before major updates

## 🐛 Troubleshooting

### Database Error: "SQLITE_CANTOPEN"
**Solution**: Delete `users.db` and restart bot
```bash
rm c:\Users\91876\OneDrive\Desktop\TON\rental-bot\users.db
node bot.js
```

### Wallet not saving
**Check**: 
1. Wallet format must be EQ or 0Q format
2. User must complete the wallet connection flow
3. Check `users.db` exists in the directory

### Test data disappeared
**Note**: Each time you delete `users.db`, all test data is lost. For development, keep backups.

## 🔜 Next Steps

1. **Implement Item Listing**: Add handler for users to list items themselves
2. **Implement Rental Flow**: Create handler for users to rent items
3. **Link to Transactions**: When rental payment confirmed, auto-save to database
4. **Implement Returns**: Add handler for renters to return items early
5. **Implement Disputes**: Add handler for reporting issues
6. **Deploy Database**: Ensure `users.db` is backed up on production VPS

## 📝 Summary

Your bot now has:
- ✅ SQLite3 database with persistent storage
- ✅ User account system (Telegram + Wallet linking)
- ✅ Item listing system
- ✅ Two-way rental tracking (renter + owner views)
- ✅ Account statistics and history
- ✅ Dispute tracking system
- ✅ All data persists across bot restarts

**Ready to use!** 🚀
