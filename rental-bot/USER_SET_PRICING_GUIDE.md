# User-Set Pricing Feature - Complete Guide

## 🎯 Overview

You now have the ability to **set your own rental prices** instead of having predetermined prices in the contract. Users can:

1. ✅ List their items for rent
2. ✅ Set their own daily rental price in TON
3. ✅ Set their own security deposit amount
4. ✅ Earn TON from their items
5. ✅ Track earnings in their account

## 📋 What Changed

### Before (Predetermined Pricing)
- Prices were hardcoded in the smart contract
- All items had the same price structure
- No flexibility for different item values
- Owners couldn't set custom prices

### After (User-Set Pricing) ✨
- Users set their own price per day
- Users set their own deposit amount
- Different prices for different items
- Maximum flexibility for marketplace

## 🚀 How to Use - Step by Step

### Step 1: Connect Your Wallet (If Not Already Connected)

```
1. Open Telegram and find your bot
2. Send /start
3. Click 🔗 Connect Wallet
4. Enter your TON wallet address (EQ... or 0Q... format)
5. Confirm: "✅ Wallet Connected!"
```

### Step 2: List a New Item

```
1. Click ➕ List New Item (from main menu)
2. You'll see: "What is the name of the item you want to rent out?"
```

### Step 3: Item Details

**You'll be asked for:**

1. **Item Name** (Step 1)
   - Example: "Mountain Bike", "Laptop", "Camera"
   - Renters will see this name

2. **Description** (Step 2)
   - Example: "Trek X-Caliber 8, excellent condition, new tires"
   - Details about condition, features, etc.

3. **Rental Price Per Day** (Step 3) - **YOU SET THIS!**
   - Example: 0.5 (means 0.5 TON per day)
   - 3-day rental = 1.5 TON
   - Set based on item value and demand

4. **Security Deposit** (Step 4) - **YOU SET THIS!**
   - Example: 2.0 (means 2.0 TON deposit)
   - Protects you if renter doesn't return item
   - Returned to renter after successful return
   - Kept by you if item is damaged/not returned

### Step 4: Item Listed!

You'll see confirmation:
```
✅ Item Listed Successfully!

📦 Item: Mountain Bike
📝 Description: Trek X-Caliber 8, excellent condition
💰 Price: 0.5 TON/day
🏠 Deposit: 2.0 TON

🎉 Your item is now available for rent!
```

## 💰 Pricing Strategy

### How to Price Your Items

**Consider These Factors:**

1. **Item Value**
   - Expensive item → Higher price + deposit
   - Cheap item → Lower price
   - Example: Laptop (0.3-0.5 TON/day) vs Bike (0.1-0.3 TON/day)

2. **Market Demand**
   - Popular items → Can charge more
   - Niche items → Lower price attracts renters

3. **Rental Duration**
   - Daily = `price_per_day` × number_of_days
   - 3-day rental at 0.5 TON/day = 1.5 TON total

4. **Risk Level**
   - Easily damaged → Higher deposit
   - Durable item → Lower deposit
   - Example: Camera (deposit 3.0) vs Helmet (deposit 0.5)

### Example Pricing Table

```
Item Type          | Price/Day | Deposit | Notes
---------------------------------------------------
Mountain Bike      | 0.5 TON   | 2.0 TON | Good condition
Road Bike          | 0.4 TON   | 1.5 TON | Lightweight
Laptop (Dell XPS)  | 0.3 TON   | 1.5 TON | High value
Camera (DSLR)      | 0.8 TON   | 5.0 TON | Expensive
Helmet             | 0.05 TON  | 0.5 TON | Safety gear
Phone              | 0.2 TON   | 1.0 TON | Portable
```

## 📊 View Your Listed Items

```
1. Click 🎁 My Items
2. See all your items with status:
   - 🟢 Available (not rented)
   - 🔴 Rented (someone is using it)
3. Shows your price and deposit for each
```

### Example Output:
```
🎁 Your Listed Items

1. Mountain Bike
   📝 Trek X-Caliber 8, excellent condition
   💰 0.5 TON/day
   Status: 🟢 Available

2. Laptop
   📝 Dell XPS 13, 512GB SSD, 16GB RAM
   💰 0.3 TON/day
   Status: 🔴 Rented (3 days remaining)
```

## 💵 Track Your Earnings

```
1. Click 👤 My Account
2. See your "Total Earned" in TON
3. Shows:
   - Items I'm Renting
   - Items Rented Out (earning!)
   - Completed Rentals
   - Total Items Listed
   - Total Earned (in TON)
```

### Example Stats:
```
📊 Your Account Statistics

Wallet: EQDaMahFb...

📈 Rental Stats:
• Items I'm Renting: 0
• Items Rented Out: 2 (earning!)
• Completed Rentals: 5
• Total Items Listed: 4
• Total Earned: 3.45 TON ✓
```

## 🔄 Rental Flow (From Renter's Perspective)

When a renter wants to rent your item:

1. **Renter sees your item** in "📦 Browse Items"
   - They see YOUR name and price
   - They see YOUR deposit amount

2. **Renter clicks to rent**
   - Pays: (price_per_day × duration) + deposit
   - Example: 0.5 TON/day × 3 days = 1.5 TON + 2.0 TON deposit = 3.5 TON total

3. **After rental is complete**
   - Item returned ✓
   - Deposit returned to renter automatically
   - YOU earn the rental price (1.5 TON in example)
   - Displayed in "Total Earned"

4. **If item not returned or damaged**
   - You can open dispute
   - Keep part/all of deposit
   - Payment system holds funds fairly

## 🔐 Important Notes

### Security Features
- ✅ Your wallet is required to list items
- ✅ All prices are stored securely in database
- ✅ Renters can see and verify your prices
- ✅ Disputes can be resolved fairly
- ✅ Deposits held in escrow

### Best Practices
- 📌 Set realistic prices for your market
- 📌 Describe items accurately (avoids disputes)
- 📌 Check competitor prices
- 📌 Higher deposit = more protection
- 📌 Be responsive to rental requests

### Pricing Tips
- Don't price too high (renters won't rent)
- Don't price too low (you won't earn)
- Consider maintenance/wear costs
- Factor in storage/insurance costs
- Adjust based on demand

## 🧪 Test the Feature

### Quick Test Workflow:

```bash
# 1. In Telegram, send /start
/start

# 2. Click ➕ List New Item
# Follow prompts:
   - Item Name: "Test Bike"
   - Description: "Good condition for testing"
   - Price: 0.3 TON/day
   - Deposit: 1.0 TON

# 3. Click 🎁 My Items
# Should see your new item listed

# 4. Click 👤 My Account
# Should show "Total Items Listed: 1"

# 5. Click 📦 Browse Items
# Should see your item in available list
```

## 📝 Database Schema

Items are stored with this information:

```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY,              -- Unique item ID
  owner_wallet TEXT NOT NULL,          -- Your wallet address
  item_name TEXT NOT NULL,             -- Name you provided
  description TEXT,                    -- Description you provided
  price_per_day REAL,                  -- Price YOU set per day
  deposit_amount REAL,                 -- Deposit YOU set
  available BOOLEAN DEFAULT 1,         -- Is it available?
  created_at DATETIME                  -- When you listed it
);
```

## 🎯 Advantages Over Fixed Pricing

| Aspect | Fixed Pricing | User-Set Pricing (NEW) |
|--------|---------------|----------------------|
| Price Flexibility | ❌ No | ✅ Yes - Set per item |
| Market Adaptation | ❌ No | ✅ Yes - Adjust anytime |
| Competition | ❌ All same | ✅ Can undercut/premium |
| Earnings | ❌ Limited | ✅ Maximize based on value |
| User Control | ❌ Smart contract only | ✅ Direct control |
| Marketplace Health | ❌ May overprice | ✅ Natural competition |

## 🚀 Next Steps

1. **Connect Your Wallet** - Link your TON wallet
2. **List Your First Item** - Set your own prices!
3. **Browse Others' Items** - See how they price
4. **Adjust Prices** - Change pricing strategy based on demand
5. **Track Earnings** - Watch your TON accumulate

## ❓ FAQ

**Q: Can I change the price after listing?**
A: Not yet - we'll add edit feature soon. Delete and re-list for now.

**Q: What's a good deposit amount?**
A: Usually 30-50% of item value. Example: $500 laptop = 2-3 TON deposit.

**Q: How much should I charge per day?**
A: Typical: 0.1-1.0 TON/day depending on item value and demand.

**Q: Can I list multiple items?**
A: Yes! List as many as you want!

**Q: Do I pay to list items?**
A: No! Listing is free. You only earn when someone rents.

**Q: When do I get paid?**
A: After rental is completed and item is returned.

**Q: What if item is damaged?**
A: Keep the deposit as compensation.

## 🎉 Summary

Your rental marketplace now has **true peer-to-peer pricing**:

- ✅ **You control prices** - Not the contract
- ✅ **You set deposits** - Customize protection
- ✅ **You earn TON** - Monetize your items
- ✅ **Flexible marketplace** - Natural price discovery
- ✅ **Fair system** - Escrow protects both parties

**Start listing items today!** 🚀
