# 🏪 TON Rental Marketplace

A decentralized rental marketplace built on the TON blockchain using Tolk smart contracts. Users can list items for rent, manage payments securely through an escrow contract, and handle disputes—all powered by TON.

## ✨ Core Features

### 1. **Listing Platform**
- Users can list items for rent (bikes, books, gadgets, electronics, etc.)
- Define rental price, deposit amount, and rental duration
- Store item metadata on-chain

### 2. **Escrow Smart Contract**
- Secure payment handling via TON blockchain
- Separate storage of rental price and security deposit
- Atomic fund release upon confirmation

### 3. **Automated Return & Deposit Release**
- Contract tracks rental period with timestamps
- **On-time return**: Deposit returned to renter, payment released to owner
- **Late return**: Deposit forfeited to owner as penalty

### 4. **Dispute Handling**
- Either party can report a dispute before funds are released
- Owner can resolve disputes with custom logic
- Two resolution options:
  - **Approve renter claim**: Return deposit to renter
  - **Deny renter claim**: Keep deposit as compensation

### 5. **Telegram Mini App Integration** (Coming Soon)
- Rent items directly from Telegram
- Manage active rentals
- Handle payments and disputes
- Real-time notifications

## 📁 Project Structure

```
rental-marketplace/
├── contracts/
│   └── rental_contract.tolk        # Main Tolk smart contract
├── wrappers/
│   ├── RentalContract.ts           # TypeScript wrapper for contract
│   └── RentalContract.compile.ts   # Contract compilation config
├── scripts/
│   └── deployRentalContract.ts     # Deployment script
├── tests/
│   └── RentalContract.spec.ts      # Comprehensive test suite
├── package.json
└── tsconfig.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js v21.6.1 or higher (recommended: v22+)
- npm or yarn
- TON CLI tools (Blueprint)

### Installation

```bash
# Navigate to the project directory
cd rental-marketplace

# Install dependencies
npm install

# Verify installation
npm run build
```

## 🧪 Testing

Run the complete test suite to verify all contract functionality:

```bash
npm run test
```

This will run comprehensive tests covering:
- ✅ Contract deployment
- ✅ Item rental creation
- ✅ On-time item returns with deposit release
- ✅ Late returns with penalties
- ✅ Dispute reporting
- ✅ Dispute resolution (both outcomes)
- ✅ Multiple concurrent rentals

### Test Output Example
```
PASS  tests/RentalContract.spec.ts
  RentalContract
    ✓ should deploy successfully
    ✓ should allow renting an item
    ✓ should handle item return on time
    ✓ should handle late item return
    ✓ should allow dispute reporting
    ✓ should allow owner to resolve dispute in renter favor
    ✓ should allow owner to resolve dispute in owner favor
    ✓ should handle multiple concurrent rentals

Tests:       8 passed, 8 total
```

## 📋 Smart Contract Operations

### 1. **rentItem** (Opcode: 0x1)
Create a new rental agreement.

**Parameters:**
- `itemId` (uint64): Unique item identifier
- `owner` (address): Item owner's address
- `price` (coins): Rental price in TON
- `deposit` (coins): Security deposit in TON
- `duration` (uint32): Rental period in seconds

**Total Value Required:** `price + deposit + gas_fee`

### 2. **returnItem** (Opcode: 0x2)
Confirm item return and process funds.

**Parameters:**
- `itemId` (uint64): Item being returned

**Logic:**
- If returned before deadline: Deposit → Renter, Payment → Owner
- If returned after deadline: (Deposit + Penalty) → Owner

### 3. **reportDispute** (Opcode: 0x3)
Flag a rental as disputed.

**Parameters:**
- `itemId` (uint64): Disputed item ID
- `reason` (string): Dispute reason

**Who Can Call:** Renter or Owner

### 4. **resolveDispute** (Opcode: 0x4)
Resolve an active dispute.

**Parameters:**
- `itemId` (uint64): Item with dispute
- `approveRenterClaim` (bool): 
  - `true`: Return deposit to renter
  - `false`: Keep deposit (owner wins)

**Who Can Call:** Item owner only

## 🔧 Building & Compiling

```bash
# Build the contract
npm run build

# Or using Blueprint directly
npx blueprint build
```

## 🚢 Deployment

### Testnet Deployment

1. **Get Testnet Tokens**
   - Visit: https://testnet.tonconsole.com
   - Request testnet TON tokens

2. **Deploy Contract**
   ```bash
   npx blueprint run deployRentalContract
   ```

3. **Select Network:** Choose "testnet" when prompted

4. **Monitor Deployment**
   - View contract address in console output
   - Verify on TON testnet explorer

### Mainnet Deployment (Production)

```bash
# Build for production
npm run build

# Deploy to mainnet
npx blueprint run deployRentalContract
# Select "mainnet" when prompted
```

## 💰 Transaction Flow Example

### Scenario: Alice rents Bob's bike for 7 days

1. **Setup:**
   - Bike ID: `1`
   - Alice (renter) balance: 10 TON
   - Bob (owner)

2. **Rental Creation:**
   - Price: 2 TON
   - Deposit: 3 TON
   - Duration: 604,800 seconds (7 days)
   - Alice sends: 5 TON + gas → Contract

3. **On-Time Return (Day 6):**
   - Alice confirms return before deadline
   - Contract releases:
     - 3 TON → Alice (deposit)
     - 2 TON → Bob (payment)

4. **Alternative: Late Return (Day 8):**
   - Alice returns item after deadline
   - Contract processes:
     - 5 TON → Bob (penalty: price + deposit)
     - 0 TON → Alice (late penalty)

## 📊 Contract Data Structure

Each rental stores:
```
struct Rental {
    owner: address;           // Item owner
    renter: address;          // Item renter
    item_id: uint64;          // Unique item ID
    price: coins;             // Rental price (TON)
    deposit: coins;           // Security deposit (TON)
    start_time: uint32;       // Rental start timestamp
    end_time: uint32;         // Rental deadline timestamp
    returned: bool;           // Return status
    dispute: bool;            // Dispute flag
}
```

## 🔐 Security Considerations

1. **Fund Safety:** All TON is held in contract, released only on confirmed actions
2. **Address Verification:** Only owner/renter can interact with specific rentals
3. **Time-Based Logic:** Blockchain timestamp ensures fair deadline enforcement
4. **Atomic Transactions:** Fund release happens atomically with status update
5. **Dispute Mechanism:** Prevents premature fund release if disagreement exists

## 🚀 Telegram Mini App Integration (Roadmap)

Future versions will include:
- [ ] Telegram Bot interface
- [ ] TON Connect integration
- [ ] In-app payments
- [ ] Real-time notifications
- [ ] Web dashboard

## 📚 Tolk Smart Contract Highlights

### Key Features Used:
- **Dictionary Storage:** Efficient rental record management
- **Message Sending:** Atomic fund transfers
- **Timestamp Handling:** Deadline enforcement
- **Error Codes:** Comprehensive error management

### Gas Optimization:
- Minimal data structures
- Efficient dictionary lookups
- Optimized message routing

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Test Failures
```bash
# Run tests with verbose output
npm run test -- --verbose

# Check Node version compatibility
node --version  # Should be v21.6.1 or higher
```

### Deployment Issues
- Ensure testnet tokens available
- Check network connectivity
- Verify contract address format

## 📖 Resources

- **TON Documentation:** https://ton.org/docs
- **Blueprint Framework:** https://github.com/ton-community/blueprint
- **Tolk Language:** https://ton.org/docs/#/smart-contracts/tolk
- **TON Testnet Console:** https://testnet.tonconsole.com

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📞 Support

For questions or issues:
- Open an GitHub issue
- Check existing documentation
- Review test cases for usage examples

---

**Happy renting! 🎉**

## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

## How to use

### Build

`npx blueprint build` or `yarn blueprint build`

### Test

`npx blueprint test` or `yarn blueprint test`

### Deploy or run another script

`npx blueprint run` or `yarn blueprint run`

### Add a new contract

`npx blueprint create ContractName` or `yarn blueprint create ContractName`
