# Complete Rental Bot Testing Guide

## ✅ What's Now Available

Your rental bot now has a **complete rental workflow**:

✅ **List Items** - Set your own prices
✅ **Browse Items** - See all available items with rent buttons
✅ **Rent Items** - Select duration and pay
✅ **Return Items** - Mark as good condition or report damage
✅ **Track Rentals** - See your active rentals
✅ **Account Stats** - View earnings and activity

---

## 🚀 Start the Bot

```bash
cd c:\Users\91876\OneDrive\Desktop\TON\rental-bot
node bot.js
```

You'll see:
```
✅ Bot is running!
💡 Send /start to your bot on Telegram to test!
```

---

## 📱 Test on Telegram Web UI

Go to: **https://web.telegram.org**

### Test Workflow 1: List Items

```
1. Send: /start
   Response: Main menu with 8 buttons

2. Click: 🔗 Connect Wallet
   Send: EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_
   Response: ✅ Wallet Connected!

3. Click: ➕ List New Item
   Bot: "What is the name of the item?"
   Send: Mountain Bike
   
   Bot: "Describe your item"
   Send: Trek X-Caliber 8, excellent condition
   
   Bot: "Set rental price - How much TON per day?"
   Send: 0.5
   
   Bot: "Set security deposit - How much TON deposit?"
   Send: 2.0
   
   Response: ✅ Item Listed Successfully!

4. Click: 🎁 My Items
   Response: Shows "Mountain Bike" with:
   💰 0.5 TON/day
   Status: 🟢 Available
```

### Test Workflow 2: Browse & Rent

```
1. Click: 📦 Browse Items
   Response: Shows all items with "Rent #1", "Rent #2" buttons

2. Click: Rent #1 (Mountain Bike)
   Bot: "How many days do you want to rent?"
   Send: 3
   
   Response: Rental Summary
   - Item: Mountain Bike
   - Duration: 3 days
   - Total Price: 1.5 TON
   - Deposit: 2.0 TON
   - Total Cost: 3.55 TON

3. Click: "Confirm Rental"
   Response: ✅ Rental Created!
   - Item: Mountain Bike
   - Duration: 3 days
   - Return by: [date + 3 days]
   - To complete: Send 3.55 TON to contract
```

### Test Workflow 3: View Your Rentals

```
1. Click: 📦 My Rentals
   Response: Shows active rentals:
   1. Mountain Bike
      Return by: 3 days
      Price: 1.5 TON
      Owner: [wallet address]

2. Click: 👤 My Account
   Response: Shows stats:
   - Items I'm Renting: 1
   - Items Rented Out: 0
   - Completed Rentals: 0
   - Total Items Listed: 1
   - Total Earned: 0 TON
```

### Test Workflow 4: Return Item

```
1. Click: ↩️ Return Item
   Response: Shows list:
   1. Mountain Bike
      Return by: 2 days
   
   Click: "Return #1"

2. Bot: "Is the item in good condition?"
   Options:
   - Click: "YES - Item is good"
   - Click: "NO - Item damaged"

3. If YES:
   Response: ✅ Return Confirmed!
   - Rental ID: #1
   - Status: Completed
   - Deposit refunded automatically!

4. If NO:
   Bot: "Please describe the damage or issue"
   Send: "Screen has crack"
   Response: Damage Report Submitted
   - Rental ID: #1
   - Reason: "Screen has crack"
   - Owner will review within 24 hours
```

### Test Workflow 5: Multiple Items

```
1. List Item 2:
   Name: Laptop
   Description: Dell XPS 13
   Price: 0.3 TON/day
   Deposit: 1.5 TON

2. List Item 3:
   Name: Camera
   Description: DSLR, 20MP
   Price: 0.8 TON/day
   Deposit: 5.0 TON

3. Click: 📦 Browse Items
   Response: Shows all 3 items

4. Click: 🎁 My Items
   Response: Shows all 3 items you own

5. Rent multiple:
   - Rent Laptop for 7 days
   - Rent Camera for 2 days

6. Click: 📦 My Rentals
   Response: Shows both renting:
   1. Laptop (7 days)
   2. Camera (2 days)
```

---

## 🧪 Key Tests to Run

### Test 1: Item Listing Variations
```
Item 1: Bike, 0.5 TON/day, 2.0 deposit
Item 2: Laptop, 0.3 TON/day, 1.5 deposit
Item 3: Camera, 0.8 TON/day, 5.0 deposit

Verify:
✓ Different prices saved correctly
✓ All items show in Browse
✓ All items show in My Items
✓ Stats show "Total Items Listed: 3"
```

### Test 2: Rental Duration Calculations
```
Item: 0.5 TON/day
Duration: 3 days
Total Price: 0.5 × 3 = 1.5 TON
Expected: Shows 1.5 TON in summary
```

### Test 3: Multiple Active Rentals
```
Rent 3 different items
Check: 📦 My Rentals shows all 3
Check: 👤 My Account shows "Items I'm Renting: 3"
```

### Test 4: Return Item Good Condition
```
1. Rent an item
2. Return Item → Select → Click YES
3. Verify: Status changed to "Completed"
```

### Test 5: Return Item Damaged
```
1. Rent an item
2. Return Item → Select → Click NO
3. Send damage description
4. Verify: Dispute reported and saved
```

### Test 6: Database Persistence
```
1. List 3 items
2. Rent 2 items
3. Stop bot: Ctrl+C
4. Start bot again: node bot.js
5. Check: /start → 🎁 My Items → Still shows 3 items
6. Check: 📦 My Rentals → Still shows 2 rentals
```

---

## 📊 Expected Behavior

### Browse Items Output
```
Available Items

1. Mountain Bike
   Trek X-Caliber 8, excellent condition
   Price: 0.5 TON/day
   Deposit: 2.0 TON

2. Laptop
   Dell XPS 13, 512GB SSD, 16GB RAM
   Price: 0.3 TON/day
   Deposit: 1.5 TON

[Rent #1] [Rent #2] [Back]
```

### My Rentals Output
```
My Active Rentals

1. Mountain Bike
   Owner: EQDaMahFb...
   Price: 1.5 TON
   Return in: 2 days
```

### Return Item Output
```
Return Item - Select which item to return:

1. Mountain Bike
   Return by: 2 days

[Return #1] [Cancel]
```

### Account Stats Output
```
Your Account

Wallet: EQDaMahFb...
Member Since: 2025-11-10

Rental Stats:
• Items I'm Renting: 1
• Items Rented Out: 1
• Completed Rentals: 0
• Total Items Listed: 2
• Total Earned: 0 TON
```

---

## 🔍 Database Verification

### Check if data is saved:
```bash
# Check if items are in database
node -e "
const UserDatabase = require('./userDatabase');
(async () => {
  const db = new UserDatabase('./users.db');
  const items = await db.getAvailableItems();
  console.log('Items in DB:', items.length);
  items.forEach(i => console.log(`- ${i.item_name}: ${i.price_per_day} TON/day`));
  process.exit(0);
})();
"
```

### Check rentals:
```bash
node -e "
const UserDatabase = require('./userDatabase');
(async () => {
  const db = new UserDatabase('./users.db');
  const wallet = 'EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_';
  const rentals = await db.getActiveRentalsForRenter(wallet);
  console.log('Active rentals:', rentals.length);
  rentals.forEach(r => console.log(`- ${r.item_name}`));
  process.exit(0);
})();
"
```

---

## 🐛 Troubleshooting

### Bot not responding?
```
1. Check if bot is running: node bot.js
2. Check if token is valid in .env
3. Try sending /start again
4. Kill bot (Ctrl+C) and restart
```

### Items not saving?
```
1. Check if users.db exists
2. Check if wallet is connected
3. Check if names are not empty
4. Check console for errors
```

### Return button not working?
```
1. Make sure you have active rentals
2. Click 📦 My Rentals to verify
3. Check if rental status is "active" in database
```

### Deposit not showing in summary?
```
1. Item must be in database with deposit_amount
2. Check database: node -e "const db = require('./userDatabase'); ..."
```

---

## ✅ Success Criteria

### All tests pass when:
- ✓ Can list items with custom prices
- ✓ Items appear in Browse with rent buttons
- ✓ Can select rental duration
- ✓ Rental summary shows correct calculation
- ✓ Rental saved to database
- ✓ My Rentals shows active rental
- ✓ Can return item (good condition)
- ✓ Can report damage
- ✓ Account stats update
- ✓ Data persists after bot restart

---

## 🎯 Complete Feature Set

```
✅ List Items (➕ List New Item)
   - User-set prices
   - User-set deposits
   - Description field
   - Database storage

✅ Browse Items (📦 Browse Items)
   - All available items
   - Rent buttons for each
   - Item details shown
   - Direct rental entry

✅ Rent Items (Click Rent #X)
   - Enter duration
   - See rental summary
   - Confirm rental
   - Save to database

✅ Return Items (↩️ Return Item)
   - Select rental to return
   - Confirm condition
   - Report damage if needed
   - Update database

✅ View Rentals (📦 My Rentals)
   - See what you're renting
   - Return dates
   - Owner info
   - Click to return

✅ Account Stats (👤 My Account)
   - Total items listed
   - Items renting now
   - Items rented out now
   - Total earnings
```

---

Enjoy testing! 🚀
