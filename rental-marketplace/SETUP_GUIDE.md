# 🚀 TON Rental Marketplace - Complete Setup & Testing Guide

## ✅ Project Status
**All tests passing! ✓** The rental marketplace smart contract is ready for development and deployment.

---

## 📊 Test Results Summary

```
✅ Test Suite: PASSED
├── ✓ should deploy successfully (860 ms)
├── ✓ should allow renting an item (177 ms)
├── ✓ should handle item return on time (216 ms)
├── ✓ should handle late item return (269 ms)
├── ✓ should allow dispute reporting (416 ms)
├── ✓ should allow owner to resolve dispute in renter favor (228 ms)
├── ✓ should allow owner to resolve dispute in owner favor (245 ms)
└── ✓ should handle multiple concurrent rentals (297 ms)

Total Time: 8.246 seconds
Tests: 8 passed, 8 total ✓
```

---

## 🏗️ Project Architecture

### Directory Structure
```
rental-marketplace/
├── contracts/
│   └── rental_contract.tolk          # Main smart contract (Tolk language)
├── wrappers/
│   ├── RentalContract.ts             # TypeScript contract wrapper
│   └── RentalContract.compile.ts     # Compilation configuration
├── scripts/
│   └── deployRentalContract.ts       # Deployment script
├── tests/
│   └── RentalContract.spec.ts        # Comprehensive test suite (8 tests)
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── jest.config.ts                    # Jest testing configuration
└── README.md                         # Full documentation
```

---

## 🎯 Core Features Implemented

### 1. **Item Rental System** ✓
- Users can rent items by specifying:
  - Unique item ID
  - Owner address
  - Rental price (in TON)
  - Security deposit (in TON)
  - Rental duration (in seconds)

### 2. **Escrow Payment Handling** ✓
- Contract securely holds both price and deposit
- Atomic fund transfers on confirmation
- No funds lost or stuck

### 3. **Automated Return Processing** ✓
- **On-time return**: Deposit returned to renter, payment to owner
- **Late return**: Deposit forfeited to owner as penalty
- **Timestamp-based**: Blockchain time ensures fairness

### 4. **Dispute Mechanism** ✓
- Either party can report disputes
- Prevents premature fund release
- Owner can resolve with two outcomes:
  - Approve renter claim → Return deposit
  - Deny renter claim → Keep deposit

### 5. **Multiple Concurrent Rentals** ✓
- Support for unlimited concurrent rentals
- Each tracked by unique item ID
- Independent fund management

---

## 🧪 Test Coverage

### Test 1: Contract Deployment ✓
```typescript
Tests that the smart contract deploys successfully
Expected: Deploy transaction succeeds
Result: ✓ PASS
```

### Test 2: Item Rental Creation ✓
```typescript
Renter sends rental request with:
- itemId: 1
- owner: Bob's address
- price: 1 TON
- deposit: 2 TON
- duration: 7 days

Expected: Transaction succeeds, funds deducted
Result: ✓ PASS (177 ms)
```

### Test 3: On-Time Return ✓
```typescript
Renter returns item within rental period:
- Start: Day 0
- Return: Day 3 (within deadline)

Expected Outcome:
- Deposit (2 TON) → Renter ✓
- Price (1 TON) → Owner ✓
Result: ✓ PASS (216 ms)
```

### Test 4: Late Return ✓
```typescript
Renter returns item after deadline:
- Start: Day 0
- Return: Day 8 (LATE)

Expected Outcome:
- Penalty: Deposit + Price (3 TON) → Owner ✓
- Renter gets: Nothing ✓
Result: ✓ PASS (269 ms)
```

### Test 5: Dispute Reporting ✓
```typescript
Renter flags item with dispute:
- Reason: "Item is damaged"

Expected: Dispute flag set, funds held
Result: ✓ PASS (416 ms)
```

### Test 6: Dispute Resolution (Renter Approved) ✓
```typescript
Owner resolves dispute in renter's favor:
- Deposit: 2 TON → Renter ✓
- Price: 1 TON → Owner ✓

Result: ✓ PASS (228 ms)
```

### Test 7: Dispute Resolution (Owner Approved) ✓
```typescript
Owner resolves dispute in owner's favor:
- Full amount: 3 TON → Owner ✓
- Renter gets: Nothing ✓

Result: ✓ PASS (245 ms)
```

### Test 8: Multiple Concurrent Rentals ✓
```typescript
Create 3 simultaneous rentals:
- Rental 101: Item 101
- Rental 102: Item 102
- Rental 103: Item 103

Expected: All tracked independently
Result: ✓ PASS (297 ms)
```

---

## 🔧 Available Commands

### Build Contract
```bash
npm run build
# Compiles Tolk contract to Fift bytecode
```

### Run Tests
```bash
npm run test
# Runs all 8 test cases using Jest + TON Sandbox
```

### Deploy Contract
```bash
npx blueprint run deployRentalContract
# Deploys to testnet or mainnet (interactive)
```

### Quick Workflow
```bash
npm run build       # 1. Compile
npm run test        # 2. Verify with tests
npm run start       # 3. Deploy or run scripts
```

---

## 💰 Transaction Flow Example

### Scenario: Alice Rents Bob's Bicycle

**Step 1: Alice Initiates Rental**
```
Alice sends to RentalContract:
├── itemId: 1001
├── owner: Bob's address
├── price: 2 TON (rental fee)
├── deposit: 5 TON (security)
├── duration: 604800 seconds (7 days)
└── total value: 7+ TON (including gas)
```

**Step 2: Contract Confirms Rental**
```
RentalContract stores:
├── owner: Bob
├── renter: Alice
├── item_id: 1001
├── price: 2 TON
├── deposit: 5 TON
├── start_time: now
├── end_time: now + 604800
├── returned: false
└── dispute: false
```

**Step 3a: Happy Path - On-Time Return (Day 6)**
```
Alice calls returnItem(itemId: 1001)
↓
Contract releases:
├── 5 TON → Alice (deposit returned)
└── 2 TON → Bob (payment)

Result: Both satisfied ✓
```

**Step 3b: Issue - Late Return (Day 8)**
```
Alice calls returnItem(itemId: 1001)
↓
Contract detects deadline passed
↓
Contract releases:
├── 0 TON → Alice (nothing)
└── 7 TON → Bob (penalty + payment)

Result: Bob compensated for late return ✓
```

**Step 3c: Dispute - Item Damage**
```
Alice calls reportDispute(itemId: 1001, reason: "Damaged")
↓
Contract flags as disputed
↓
Bob reviews and calls resolveDispute(itemId: 1001, approved: true/false)
├── If approved: 5 TON → Alice (dispute resolved fair)
└── If denied: 7 TON → Bob (Alice pays penalty)

Result: Dispute settled ✓
```

---

## 🔐 Security Features

### 1. **Address Verification**
- Only owner or renter can interact with rental
- Prevents unauthorized access

### 2. **Atomic Transactions**
- Fund transfers happen with status updates
- No partial execution possible

### 3. **Time-Based Fairness**
- Uses blockchain timestamp (now())
- Deadline is absolute and cannot be manipulated

### 4. **Fund Safety**
- All TON held in contract until release
- No direct account-to-account transfers before confirmation

### 5. **Dispute Prevention**
- Flags prevent early fund release
- Both parties have resolution opportunity

---

## 📦 Smart Contract Operations

### Operation Codes
```typescript
0x1 → rentItem           // Initiate rental
0x2 → returnItem         // Confirm return
0x3 → reportDispute      // Flag dispute
0x4 → resolveDispute     // Owner settles dispute
0x5 → adminWithdraw      // (future) Withdraw fees
```

### Data Structure
```typescript
struct Rental {
  owner: Address           // Item owner
  renter: Address          // Renter's address
  item_id: uint64          // Unique item ID
  price: coins             // Rental price in TON
  deposit: coins           // Security deposit in TON
  start_time: uint32       // Rental start timestamp
  end_time: uint32         // Rental deadline timestamp
  returned: bool           // Return status
  dispute: bool            // Dispute flag
}
```

---

## 🚀 Deployment Steps

### Prerequisites
1. Node.js v21.6.1+ (or v22+)
2. npm/yarn package manager
3. TON wallet with testnet tokens

### Testnet Deployment

**Step 1: Get Testnet TON**
```bash
# Visit: https://testnet.tonconsole.com
# Request testnet tokens (free)
```

**Step 2: Build Contract**
```bash
npm run build
```

**Step 3: Deploy**
```bash
npx blueprint run deployRentalContract
```

**Step 4: Select Network**
```
Choose network: testnet
```

**Step 5: Confirm Deployment**
```
Contract Address: EQAx...
Status: Deployed ✓
```

### Mainnet Deployment (Production)
```bash
# Same steps, but select "mainnet" when prompted
# Requires real TON tokens
npx blueprint run deployRentalContract
```

---

## 📚 Technology Stack

### Languages
- **Tolk**: Smart contract language (TON blockchain)
- **TypeScript**: Wrapper and deployment scripts
- **Jest**: Testing framework

### Libraries
- `@ton/core`: Core TON SDK
- `@ton/sandbox`: Local blockchain simulator
- `@ton/blueprint`: TON development framework
- `@ton/tolk-js`: Tolk compiler

### Tools
- **Blueprint**: Build and deployment automation
- **Tolk Compiler v1.1.0**: Compiles to Fift bytecode

---

## 🎓 Learning Resources

### Official Documentation
- **TON Blockchain**: https://ton.org/docs
- **Blueprint Framework**: https://github.com/ton-community/blueprint
- **Tolk Language**: https://ton.org/docs/#/smart-contracts/tolk
- **TON Testnet**: https://testnet.tonconsole.com

### Contract Development
- Test suite: `/tests/RentalContract.spec.ts`
- Wrapper: `/wrappers/RentalContract.ts`
- Smart contract: `/contracts/rental_contract.tolk`

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Rebuild
npm run build
```

### Tests Fail
```bash
# Check Node version
node --version        # Should be v21.6.1+

# Run with verbose output
npm run test -- --verbose

# Check individual test
npm run test -- --testNamePattern="should deploy"
```

### Deployment Issues
```bash
# Verify contract compiles
npm run build

# Check testnet tokens available
# Visit: https://testnet.tonconsole.com

# Retry deployment
npx blueprint run deployRentalContract
```

---

## 📈 Next Steps

### Phase 1: Core Marketplace (Current)
✅ Smart contract with rental logic
✅ Escrow and payment handling
✅ Dispute resolution mechanism
✅ Comprehensive test suite

### Phase 2: Item Listing (Upcoming)
- [ ] Item registry/catalog
- [ ] Owner metadata storage
- [ ] Search and filtering

### Phase 3: Telegram Integration (Upcoming)
- [ ] Telegram Mini App UI
- [ ] TON Connect integration
- [ ] In-app payments
- [ ] Real-time notifications

### Phase 4: Advanced Features (Planned)
- [ ] Rating and reviews system
- [ ] Insurance/protection plans
- [ ] Automated marketplace fees
- [ ] Admin dashboard

---

## 🤝 Contributing

To contribute to this project:
1. Fork repository
2. Create feature branch
3. Test thoroughly
4. Submit pull request

---

## ❓ FAQ

**Q: How much does it cost to deploy?**
A: Minimal gas fees (~0.1 TON) for deployment. Transaction costs depend on operation size.

**Q: Can rentals be extended?**
A: Current version: No. Future versions will support duration extension.

**Q: What happens if both parties dispute?**
A: Owner makes final decision. Future: Multi-sig or DAO resolution.

**Q: Is there a platform fee?**
A: Currently: No. Future: Optional 2-3% marketplace fee.

**Q: Can items be listed without rental?**
A: Current version: No. Listings are on-chain via rental contract only.

---

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: README.md
- **Tests**: See `/tests` directory for usage examples

---

**Project Status**: 🟢 Active Development | ✅ Tests Passing | 🚀 Ready for Testnet

Last Updated: November 8, 2025
