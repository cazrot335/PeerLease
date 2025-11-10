# How to Rent and Return Items - Quick Guide

## 🎯 Complete Rental Workflow

### PART 1: RENTING ITEMS 🏪

#### Step 1: Browse Items
```
1. Click "📦 Browse Items"
2. See all available items with prices
3. Each item shows:
   - Item name
   - Description
   - Price/day
   - Required deposit
```

#### Step 2: Click "Rent" Button
```
For each item, there's a "Rent #1", "Rent #2" button
Click the one you want to rent
```

#### Step 3: Enter Rental Duration
```
Bot: "How many days do you want to rent?"
You: Send number of days
Example: 3 (for 3 days)
```

#### Step 4: Review Summary
```
Bot shows:
- Item name
- Your chosen duration
- Price per day
- Deposit required
- Total cost to pay

Example:
Rental Summary
Item: Mountain Bike
Duration: 3 days
Price/day: 0.5 TON
Total Price: 1.5 TON
Deposit: 2.0 TON
Gas Fee: 0.05 TON
---
Total Cost: 3.55 TON
```

#### Step 5: Confirm
```
Click "Confirm Rental"
Bot creates rental in database
Status: Active (waiting for payment)
```

#### Step 6: Complete Payment
```
Bot: "To complete: Send X TON to contract"

You need to:
1. Open your TON wallet
2. Send the total amount to the smart contract
3. Payment confirmed automatically

Your rental starts!
Return by: [date shown]
```

---

### PART 2: RETURNING ITEMS ↩️

#### Step 1: Click Return Item
```
Click "↩️ Return Item" from main menu
Bot shows list of your active rentals
```

#### Step 2: Select Item to Return
```
Bot shows:
1. Mountain Bike
   Return by: 2 days
   
2. Laptop
   Return by: 5 days

Click "Return #1" or "Return #2"
```

#### Step 3: Item Condition Check
```
Bot: "Is the item in good condition?"

Options:
- Click "YES - Item is good"
- Click "NO - Item damaged"
```

#### Step 4: Return Confirmed (Good Condition)
```
If you click "YES":
✓ Return Confirmed!
✓ Status: Completed
✓ Deposit refunded automatically
```

#### Step 4B: Report Damage (If Damaged)
```
If you click "NO - Item damaged":
Bot: "Please describe the damage or issue"

You send description:
"Screen has crack"
or
"Tire is flat"

Bot creates dispute:
- Owner will review
- You'll be contacted in 24 hours
- Fair resolution applied
```

---

## 📊 Complete Example Workflow

### Example: Rent a Bike for 3 Days

```
User's Actions:
1. Click "📦 Browse Items"
   Sees: Mountain Bike - 0.5 TON/day, 2.0 TON deposit

2. Click "Rent #1"
   Bot: "How many days?"
   
3. Send: 3
   Bot shows rental summary: 3.55 TON total
   
4. Click "Confirm Rental"
   Bot: Rental created!
   
5. Open TON wallet and send 3.55 TON to contract
   Blockchain confirms payment

6. Rental active! ✓
   Return by: [date + 3 days]
   
7. Use bike for 3 days

8. Click "↩️ Return Item"
   
9. Click "Return #1"
   
10. Click "YES - Item is good"
    Bot: ✓ Return Confirmed!
    
11. Deposit automatically refunded to your wallet ✓
    Owner receives 1.5 TON payment ✓
```

---

## 💡 Key Points

### Payment Flow
```
You send to contract:
  Rental Price + Deposit + Gas Fee
  
Breakdown:
  - Rental Price → Goes to owner
  - Deposit → Held in escrow
  - Gas Fee → Network fee
  
If item returned OK:
  - Deposit → Refunded to you
  - Owner gets rental price
  
If item damaged:
  - Dispute opened
  - Owner + you negotiate
  - Fair resolution applied
```

### Timeline
```
Day 0: You pay and start rental
Day 1-2: You use the item
Day 3: Return deadline
Day 3: You return item
Day 3: Deposit refunded (if good condition)
```

### Status Changes
```
Active    → You're currently renting
Completed → Item returned successfully
Disputed  → Issue reported, being resolved
```

---

## ❓ FAQ

**Q: What if I'm late returning?**
A: Late fees may apply. Contact owner before deadline if needed.

**Q: What if item is damaged during my rental?**
A: Click "NO - Item damaged" when returning. Open dispute with reason. Owner reviews and decides on compensation.

**Q: Can I cancel a rental after paying?**
A: Depends on blockchain confirmation. Contact owner immediately if you need to cancel.

**Q: When do I get my deposit back?**
A: Automatically refunded when you return item in good condition. If disputed, 24-48 hours after resolution.

**Q: Can I rent multiple items at once?**
A: Yes! Rent one, then browse and rent another. You can have multiple active rentals.

**Q: What if the item is not available?**
A: If someone else rented it first, you'll see "No items available" or it won't appear in the list.

---

## 🔐 Safety Tips

1. **Read Description** - Check item details before renting
2. **Know Return Date** - Bot shows exact return deadline
3. **Inspect Item** - Check condition when you pick it up
4. **Report Issues** - Return as "damaged" if there are problems
5. **Keep Records** - Screenshots help if disputes arise

---

## ⚡ Quick Commands

```
/start              - Main menu
Click: 📦 Browse    - See items to rent
Click: 📦 My Rentals - See what you're renting
Click: ↩️ Return    - Return an item
Click: 👤 Account   - See your stats
```

---

## 🎯 Summary

**To Rent:**
1. Browse Items → Click Rent → Enter days → Confirm → Pay

**To Return:**
1. Click Return Item → Select item → Good/Bad condition → Done!

**Payment:**
- You pay upfront (rental + deposit + fee)
- Deposit returned when you return item
- Owner gets rental price

**Disputes:**
- If damaged, report when returning
- Owner reviews and decides
- Fair resolution applied

That's it! 🚀 Start renting now!
