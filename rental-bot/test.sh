#!/bin/bash

# Quick Bot Testing Script
# This script helps you test the wallet connection and account features

echo "🚀 Rental Bot Testing Script"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

case "$1" in
  start)
    echo -e "${YELLOW}Starting bot...${NC}"
    node bot.js
    ;;
  
  init-db)
    echo -e "${YELLOW}Initializing database...${NC}"
    node -e "
    const UserDatabase = require('./userDatabase');
    (async () => {
      const db = new UserDatabase('./users.db');
      console.log('✅ Database initialized successfully!');
      process.exit(0);
    })();
    "
    ;;
  
  add-test-user)
    echo -e "${YELLOW}Adding test user...${NC}"
    node -e "
    const UserDatabase = require('./userDatabase');
    (async () => {
      const db = new UserDatabase('./users.db');
      await db.addUser(123456789, 'testuser');
      const user = await db.getUserByTelegramId(123456789);
      console.log('✅ Test user added:');
      console.log(JSON.stringify(user, null, 2));
      process.exit(0);
    })();
    "
    ;;
  
  add-test-items)
    echo -e "${YELLOW}Adding test items...${NC}"
    node -e "
    const UserDatabase = require('./userDatabase');
    (async () => {
      const db = new UserDatabase('./users.db');
      const walletAddress = 'EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_';
      
      await db.addItem(
        walletAddress,
        'Mountain Bike',
        'Trek X-Caliber 8, excellent condition',
        0.5,
        2.0
      );
      
      await db.addItem(
        walletAddress,
        'Laptop',
        'Dell XPS 13, 512GB SSD, 16GB RAM',
        0.3,
        1.5
      );
      
      console.log('✅ Test items added successfully!');
      process.exit(0);
    })();
    "
    ;;
  
  list-items)
    echo -e "${YELLOW}Listing all items...${NC}"
    node -e "
    const UserDatabase = require('./userDatabase');
    (async () => {
      const db = new UserDatabase('./users.db');
      const items = await db.getAvailableItems();
      console.log('📦 Available Items:');
      console.log(JSON.stringify(items, null, 2));
      process.exit(0);
    })();
    "
    ;;
  
  add-rental)
    echo -e "${YELLOW}Creating test rental...${NC}"
    node -e "
    const UserDatabase = require('./userDatabase');
    (async () => {
      const db = new UserDatabase('./users.db');
      const ownerWallet = 'EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_';
      const renterWallet = 'EQA_EFILx3xREAAIvxWgXEhKqJVa0NhHM8CZT0MXAhZvf5z_';
      
      await db.createRental(1, renterWallet, ownerWallet, 3, 1.5, 2.0, '1234567890ABCDEF');
      console.log('✅ Test rental created!');
      process.exit(0);
    })();
    "
    ;;
  
  clean-db)
    echo -e "${RED}Deleting database...${NC}"
    rm -f users.db
    echo -e "${GREEN}✅ Database deleted!${NC}"
    ;;
  
  stats)
    echo -e "${YELLOW}Getting rental stats...${NC}"
    node -e "
    const UserDatabase = require('./userDatabase');
    (async () => {
      const db = new UserDatabase('./users.db');
      const walletAddress = 'EQDaMahFbBsyXPEhHqbqonZHpIBgpD9Ew0vtI6PeZSA_3ZY_';
      const stats = await db.getRentalStats(walletAddress);
      console.log('📊 Rental Statistics:');
      console.log(JSON.stringify(stats, null, 2));
      process.exit(0);
    })();
    "
    ;;
  
  *)
    echo "Usage: $0 {start|init-db|add-test-user|add-test-items|list-items|add-rental|clean-db|stats}"
    echo ""
    echo "Commands:"
    echo "  start          - Start the bot"
    echo "  init-db        - Initialize database"
    echo "  add-test-user  - Add a test user"
    echo "  add-test-items - Add sample items for testing"
    echo "  list-items     - List all available items"
    echo "  add-rental     - Create a test rental"
    echo "  clean-db       - Delete the database (reset)"
    echo "  stats          - Get rental statistics"
    echo ""
    echo "Example workflow:"
    echo "  1. $0 init-db"
    echo "  2. $0 add-test-user"
    echo "  3. $0 add-test-items"
    echo "  4. $0 list-items"
    echo "  5. $0 start"
    ;;
esac
