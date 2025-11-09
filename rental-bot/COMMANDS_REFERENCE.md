# 📱 Telegram Bot - Command & Button Reference

## 🎮 User Commands

### `/start`
**Purpose:** Initialize bot and show main menu

**Bot Response:**
```
👋 Welcome [Username]!

🏪 TON Rental Marketplace

Rent items securely on TON blockchain!

[Buttons:]
- 🏪 Rent Item
- 📦 My Rentals
- 🔙 Return Item
- ⚠️ Report Issue
- ❓ Help
```

---

### `/help`
**Purpose:** Show detailed help message

**Bot Response:**
```
📖 How to Use

🏪 Rent Item:
1. Click "Rent Item"
2. Enter item details
3. Pay with TON wallet
4. Rental starts!

📦 View Rentals:
Click "My Rentals" to see all your active rentals

🔙 Return Item:
1. Click "Return Item"
2. Select rental
3. Confirm return
4. Deposit refunded automatically!

⚠️ Report Issue:
If item has problems:
1. Click "Report Issue"
2. Describe the problem
3. Owner will review
4. Fair resolution!

💰 Pricing:
- Rental price varies by item
- Security deposit required
- Deposit returned on successful return
- Late fees apply if returned late

🔐 Security:
✓ All payments secure
✓ Funds held in escrow
✓ Fair dispute resolution
✓ Blockchain verified
```

---

### `/status`
**Purpose:** Show bot and contract status

**Bot Response:**
```
✅ Bot Status

Server: Running ✓
Network: testnet
Contract: EQDaMahFbBsyXPEhHq...
Uptime: X minutes
```

---

## 🔘 Main Menu Buttons

### 🏪 **Rent Item**
**Callback:** `rent_start`

**Flow:**
1. User clicks button
2. Bot asks: "Enter Item ID (number):"
3. User enters: `1`
4. Bot asks: "Enter rental price (in TON):"
5. User enters: `2`
6. Bot asks: "Enter deposit amount (in TON):"
7. User enters: `5`
8. Bot asks: "Enter rental duration (in days):"
9. User enters: `7`
10. Bot shows summary with payment button
11. User clicks payment button
12. Wallet app opens for payment

---

### 📦 **My Rentals**
**Callback:** `my_rentals`

**Bot Response:**
```
📦 Your Active Rentals

1. Bike
   💰 2 TON / 📅 4 days

2. Book
   💰 0.5 TON / 📅 2 days

[Return buttons for each item]
```

---

### 🔙 **Return Item**
**Callback:** `return_start`

**Flow:**
1. User clicks button
2. Bot asks: "Enter Rental Item ID:"
3. User enters: `1`
4. Bot shows return summary
5. User clicks "✅ Confirm Return"
6. Wallet opens for confirmation
7. Payment completed
8. Deposit refunded

---

### ⚠️ **Report Issue**
**Callback:** `dispute_start`

**Flow:**
1. User clicks button
2. Bot asks: "Enter Rental Item ID:"
3. User enters: `1`
4. Bot asks: "Describe the issue in detail:"
5. User enters: "Item is damaged"
6. Bot shows dispute summary
7. User clicks "📢 Submit Report"
8. Wallet opens for confirmation
9. Dispute logged on blockchain
10. Owner notified

---

### ❓ **Help**
**Callback:** `help`

Shows detailed help menu (see `/help` command above)

---

## 💳 Payment Buttons

### **💳 Pay with TON Wallet** (for Rent)
**Callback:** Dynamic URL (opens wallet)

**What it does:**
- Generates TON Connect deep link
- Opens user's wallet app
- Shows transaction details
- Amount: Price + Deposit + 0.1 TON
- User signs transaction
- Payment executed

---

### **✅ Confirm Return** (for Return)
**Callback:** Dynamic URL (opens wallet)

**What it does:**
- Creates return transaction
- Opens wallet app
- Amount: 0.05 TON (gas fee)
- User signs
- Deposit refund initiated

---

### **📢 Submit Report** (for Dispute)
**Callback:** Dynamic URL (opens wallet)

**What it does:**
- Creates dispute transaction
- Includes issue description
- Opens wallet app
- Amount: 0.05 TON (gas fee)
- User signs
- Dispute logged

---

## ⚙️ Secondary Buttons

### **❓ Need Help?**
**Callback:** `help`
Shows help menu

### **❌ Cancel**
**Callback:** `cancel`
Cancels current operation

---

## 📊 Transaction Confirmations

After successful payment:

```
✅ Rental Created!

Item ID: #1
Price: 2 TON
Deposit: 5 TON
Duration: 7 days
Status: Active ✓
```

---

## 🔄 Session Flow Example

### **Complete Rent Flow:**

```
User: /start
Bot: [Shows main menu]

User: [Clicks 🏪 Rent Item]
Bot: "Enter Item ID (number):"

User: 1
Bot: "Enter rental price (in TON):"

User: 2
Bot: "Enter deposit amount (in TON):"

User: 5
Bot: "Enter rental duration (in days):"

User: 7
Bot: [Shows summary]
     ✅ Rental Summary
     
     📋 Item ID: #1
     💰 Price: 2 TON
     🏠 Deposit: 5 TON
     📅 Duration: 7 days
     💵 Total: 7.1 TON
     
     [💳 Pay with TON Wallet]

User: [Clicks payment button]
[Wallet app opens]

User: [Reviews and signs transaction]
[Wallet sends 7.1 TON to contract]

Bot: [Confirms]
     ✅ Payment Confirmed!
     
     Your rental has started.
     Expected return date: [date]
     
     [Main menu buttons]
```

---

## 📝 Input Validation

### **Item ID**
- Must be number
- Example: `1`, `2`, `100`
- ❌ Invalid: `abc`, `1.5`

### **Price**
- Must be number or decimal
- Example: `2`, `2.5`, `0.1`
- ❌ Invalid: `abc`, `-1`

### **Deposit**
- Must be number or decimal
- Example: `5`, `5.5`, `0.01`
- ❌ Invalid: `abc`, `-5`

### **Duration**
- Must be number (days)
- Example: `1`, `7`, `30`
- ❌ Invalid: `0.5`, `-1`, `abc`

### **Description**
- Any text allowed
- Examples: "Item damaged", "Missing parts"
- Max: 200 characters (recommended)

---

## 🎯 Button Matrix

| Scenario | Button | Action |
|----------|--------|--------|
| Main Menu | 🏪 Rent Item | Start rental |
| Main Menu | 📦 My Rentals | View active |
| Main Menu | 🔙 Return Item | Return rental |
| Main Menu | ⚠️ Report Issue | Report problem |
| Main Menu | ❓ Help | Show help |
| Rental Summary | 💳 Pay Now | Open wallet |
| Return Screen | ✅ Confirm Return | Open wallet |
| Dispute Screen | 📢 Submit Report | Open wallet |
| Any | ❓ Need Help? | Show help |
| Any | ❌ Cancel | Exit flow |

---

## 💬 Quick Response Messages

### ✅ **Success Messages**

```
✅ Payment Confirmed!
   Rental activated on blockchain

✅ Return Processed!
   Deposit returned to wallet

✅ Dispute Reported!
   Owner will review within 24 hours
```

### ❌ **Error Messages**

```
❌ Invalid Input
   Please enter a valid number

❌ Network Error
   Connection failed, try again

❌ Transaction Failed
   Insufficient balance in wallet
```

### ⏳ **Status Messages**

```
⏳ Processing...
   Please wait

⏳ Pending Review...
   Owner reviewing your dispute

✓ Confirmed!
   Transaction verified
```

---

## 🔐 Security Messages

```
🔐 Secure Transaction
   Your wallet will verify this payment

🔐 Private Key Safe
   Wallet never shares your private key

🔐 Blockchain Verified
   All transactions recorded on chain
```

---

## 🎚️ Commands Cheat Sheet

```
/start   → Main menu
/help    → Help message
/status  → Bot status

🏪 Rent      → Create rental
📦 Rentals   → View rentals
🔙 Return    → Return item
⚠️ Dispute   → Report issue
❓ Help      → Help menu
```

---

## 📱 Integration Points

**User** → **Telegram Bot** → **TON Connect** → **Smart Contract**

```
Commands flow:
/start → Parse command → Execute handler → Send response

Button flow:
User click → Callback query → Route to handler → Generate transaction → 
Send deep link → User signs → Contract executes
```

---

## 🚀 Quick Test

Send these to bot in order:

1. `/start` (see main menu)
2. `/help` (see help)
3. Click 🏪 Rent Item
4. Enter: `1` (item id)
5. Enter: `0.1` (price)
6. Enter: `0.1` (deposit)
7. Enter: `1` (duration)
8. Click 💳 Pay button
9. (Wallet opens)
10. `/status` (check status)

---

## 🎊 That's It!

Your bot responds to all these commands and buttons.

Users can now rent, return items, and report issues all through Telegram!

**Ready to test? Send `/start` to your bot! 🚀**
