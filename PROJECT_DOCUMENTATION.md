# 📘 PeerLease - Project Documentation

**A Peer-to-Peer Rental Marketplace Built on TON Blockchain**

---

## 🎯 Project Overview

**PeerLease** is a decentralized peer-to-peer rental marketplace enabling users to list, browse, and rent items on the TON blockchain. Built with user-controlled pricing, secure wallet integration, and persistent data storage.

**Vision:** Empower individuals to monetize unused items while providing affordable rental options - powered by blockchain and Telegram.

---

## 💡 Inspiration & Problem Solved

### **The Problem**
Traditional rental platforms charge 15-30% commissions, limit user control over pricing, lack transparency, and have high transaction fees.

### **Our Solution**
- **Peer-to-Peer:** Remove intermediaries entirely
- **Blockchain-Secured:** TON ensures transparent, immutable records
- **User-Controlled:** Owners set their own prices and terms
- **Low Fees:** Smart contracts eliminate middlemen
- **Telegram Native:** Accessible to 900M+ users

### **Key Vision**
1. Anyone can become a rental business owner (no platform approval)
2. Owners keep 100% of earnings (no platform fees)
3. Rentals are transparent (all transactions on-chain)
4. Trust is built by the system (deposits & dispute resolution)
5. Global accessibility (Telegram reaches worldwide)

---

## 🛠️ Tech Stack

```
Frontend:     TeleBot.js (v1.4.1) - Telegram bot interface
Backend:      Node.js (v21.6.1) - Runtime environment
Database:     SQLite3 (v5.1.7) - Local persistent storage
Blockchain:   TON Network (Testnet) - Smart contracts & wallet
Integration:  TON Connect + Manual wallet entry
```

**Why Telegram?**
- 900M+ active users globally
- No app installation needed
- Built-in payment API support
- Cross-platform (mobile, desktop, web)
- Familiar to non-tech users

---

## 🏗️ Architecture Overview

```
Telegram Users (900M+)
         ↓
    Telegram Bot (TeleBot.js)
    ├─ 8 Menu Buttons
    ├─ 5 User Flows
    └─ Session Management
         ↓
    ┌────┴────────────┐
    ↓                 ↓
Database (SQLite3)   Blockchain (TON)
├─ 5 Tables         ├─ Smart Contract
├─ Users            ├─ Wallet Integration
├─ Items            └─ Transaction Verify
├─ Rentals          
├─ Disputes         
└─ Sessions         
```

**5 Database Tables:**
- **Users:** telegram_id, wallet_address, username
- **Items:** owner_wallet, item_name, price_per_day, deposit_amount
- **Rentals:** item_id, renter_wallet, owner_wallet, dates, payment_status
- **Disputes:** rental_id, reported_by, reason, resolution
- **Sessions:** telegram_id, wallet_address, session_token

---

## 🔄 User Flow (Complete Lifecycle)

```
1. /start → Main Menu (8 buttons)
2. Connect Wallet → Paste TON address (EQ/0Q format)
3. List Item → 4 steps: name → description → price → deposit
4. Browse Items → See all items with prices
5. Rent Item → Select item → Enter days → Confirm & Pay
6. Payment → Generate TON transfer link → User signs → Balance verified
7. Return Item → Mark returned → Choose condition
8. If Damaged → Report reason → Create dispute
9. Owner Decides → Refund deposit or keep (for damage)
```

---

## 🚀 How We Built It - Development Journey

### **Phase 1: Foundation**
- Basic Telegram bot with menu buttons
- SQLite3 database initialization
- User wallet storage

### **Phase 2: Core Features**
- List item flow (4-step process)
- Browse items display
- Rental creation logic

### **Phase 3: Wallet Integration**
- TON Connect popup (failed - caused signin loop)
- Switched to manual wallet paste (proven reliable)
- Full wallet display in code block format

### **Phase 4: Payment System**
- Automated payment link generation
- Balance checking for verification (check every 5 seconds)
- Transaction confirmation logic

### **Phase 5: Documentation**
- Comprehensive README with diagrams
- User guides and troubleshooting
- Architecture documentation

---

## 🔧 Technical Challenges & Solutions

### **Challenge 1: Emoji Encoding Issues**
**Problem:** String replacement failed with emoji characters
**Solution:** Use terminal commands instead of code-based replacement
**Lesson:** Emoji great for UX, terrible for string matching

### **Challenge 2: TON Connect Popup Failing**
**Problem:** Popup redirected to signin page instead of connecting
**Solution:** Switched to simple manual wallet paste (copy-paste method)
**Lesson:** Simple > Complex; users prefer transparent flows

### **Challenge 3: Transaction Verification**
**Problem:** How to verify payment without smart contract calls?
**Solution:** Check wallet balance before & after; if decreased by rental amount → confirmed
**Lesson:** Blockchain is transparent - use it smartly!

### **Challenge 4: Multi-Step Flow Management**
**Problem:** How to track which step user is on when they switch between chats?
**Solution:** Session-based state management (store in memory with telegram_id as key)
**Lesson:** Always maintain user context in multi-step flows

### **Challenge 5: Wallet Display on Telegram**
**Problem:** 48-char wallet address clutters the chat
**Solution:** Display in code block (monospace) - standard Telegram practice
**Lesson:** Follow platform conventions for better UX

---

## 📚 Key Learnings

### **Blockchain Development**
1. Smart contracts are optional for MVP
2. Wallet integration is harder than expected
3. Balance checking is a reliable verification proxy

### **Backend Development**
4. Session management is critical for multi-step flows
5. Database schema matters - design with relationships in mind
6. Error handling must be user-friendly, not technical

### **User Experience**
7. Simplicity beats feature-richness
8. Follow platform conventions (Telegram formatting)
9. Show wallet addresses in full - don't truncate

### **Project Management**
10. Documentation must stay updated with code
11. ASCII diagrams communicate better than prose
12. Test on real Telegram, not simulators

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Bot Code | 1,410 lines |
| Database Code | 368 lines |
| Database Tables | 5 |
| Menu Buttons | 8 |
| User Flows | 5 |
| Multi-step Flows | 3 |
| Callback Handlers | 15+ |

---

## 🌟 Achievements

✅ Full MVP built & tested  
✅ All features working (list, browse, rent, return, disputes)  
✅ Database persisting across restarts  
✅ Wallet integration functional  
✅ Production-ready code  
✅ Comprehensive documentation  

---

## 💪 Why PeerLease?

**Name:** Peer (user-to-user) + Lease (rental) = PeerLease

**Impact:**
- Enables side income for asset owners
- Reduces rental costs for consumers (50-70% cheaper)
- Creates trust through blockchain
- Accessible to unbanked populations

**Core Promise:**
- ✅ No platform fees (blockchain-powered)
- ✅ User-controlled pricing
- ✅ Transparent transactions
- ✅ Global accessibility via Telegram
- ✅ Complete data ownership

---

**Last Updated:** November 14, 2025  
**Status:** ✅ MVP Complete & Production Ready  
**Blockchain:** TON Testnet (Ready for Mainnet)

*"Decentralizing the sharing economy, one rental at a time."*
