// 🤖 Simple Telegram Bot Starter Template
// Complete working example for TON Rental Marketplace

require('dotenv').config();
const TeleBot = require('telebot');
const { toNano, beginCell, Address } = require('@ton/core');
const TONConnectService = require('./tonConnectService');

// ============================================================================
// Configuration
// ============================================================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CONTRACT_ADDRESS = process.env.TON_CONTRACT_ADDRESS;
const OWNER_WALLET = process.env.OWNER_WALLET_ADDRESS || 'UQCD39VS5c5rw-EWXMij4ygv3vPpmzuwVmT6R7sQKLSVuDA';
const TON_NETWORK = process.env.TON_NETWORK || 'testnet';

if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not set in .env');
  process.exit(1);
}

if (!CONTRACT_ADDRESS) {
  console.error('❌ Error: TON_CONTRACT_ADDRESS not set in .env');
  process.exit(1);
}

// ============================================================================
// Initialize Bot & TON Connect Service
// ============================================================================

const bot = new TeleBot({
  token: BOT_TOKEN,
  polling: { interval: 300, timeout: 0 }
});

// Initialize TON Connect Service
const tonService = new TONConnectService(CONTRACT_ADDRESS, TON_NETWORK);

// Store user sessions
const sessions = {};
const pendingTransactions = {};

// ============================================================================
// Main Menu
// ============================================================================

const mainMenu = bot.inlineKeyboard([
  [bot.inlineButton('🏪 Rent Item', { callback: 'rent_start' })],
  [bot.inlineButton('📦 My Rentals', { callback: 'my_rentals' })],
  [bot.inlineButton('🔙 Return Item', { callback: 'return_start' })],
  [bot.inlineButton('⚠️ Report Issue', { callback: 'dispute_start' })],
  [bot.inlineButton('❓ Help', { callback: 'help' })]
]);

// ============================================================================
// Commands
// ============================================================================

// /start - Show main menu
bot.on('/start', (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'User';
  
  bot.sendMessage(
    chatId,
    `👋 Welcome ${firstName}!\n\n🏪 TON Rental Marketplace\n\nRent items securely on TON blockchain!`,
    { markup: mainMenu, parseMode: 'html' }
  );
});

// /help - Show help
bot.on('/help', (msg) => {
  bot.sendMessage(msg.chat.id, `
📖 <b>How to Use</b>

<b>🏪 Rent Item:</b>
1. Click "Rent Item"
2. Enter item details
3. Pay with TON wallet
4. Rental starts!

<b>📦 View Rentals:</b>
Click "My Rentals" to see all your active rentals

<b>🔙 Return Item:</b>
1. Click "Return Item"
2. Select rental
3. Confirm return
4. Deposit refunded automatically!

<b>⚠️ Report Issue:</b>
If item has problems:
1. Click "Report Issue"
2. Describe the problem
3. Owner will review
4. Fair resolution!

<b>💰 Pricing:</b>
- Rental price varies by item
- Security deposit required
- Deposit returned on successful return
- Late fees apply if returned late

<b>🔐 Security:</b>
✓ All payments secure
✓ Funds held in escrow
✓ Fair dispute resolution
✓ Blockchain verified
  `, { parseMode: 'html' });
});

// /status - Bot status
bot.on('/status', (msg) => {
  bot.sendMessage(msg.chat.id, `
✅ <b>Bot Status</b>

Server: Running ✓
Network: ${process.env.TON_NETWORK || 'testnet'}
Contract: ${CONTRACT_ADDRESS.substring(0, 20)}...
Uptime: ${Math.floor(process.uptime() / 60)} minutes
  `, { parseMode: 'html' });
});

// ============================================================================
// Callback Handlers
// ============================================================================

bot.on('callbackQuery', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const msgId = query.message.message_id;

  try {
    // Rent item flow
    if (data === 'rent_start') {
      sessions[chatId] = { action: 'rent', step: 1 };
      bot.sendMessage(chatId, '📝 <b>Create New Rental</b>\n\nEnter <b>Item ID</b> (number):', { 
        parseMode: 'html' 
      });
    }

    // View rentals
    else if (data === 'my_rentals') {
      handleViewRentals(chatId);
    }

    // Return item flow
    else if (data === 'return_start') {
      sessions[chatId] = { action: 'return', step: 1 };
      bot.sendMessage(chatId, '🔙 <b>Return Item</b>\n\nEnter <b>Rental Item ID</b>:', { 
        parseMode: 'html' 
      });
    }

    // Report dispute flow
    else if (data === 'dispute_start') {
      sessions[chatId] = { action: 'dispute', step: 1 };
      bot.sendMessage(chatId, '⚠️ <b>Report Issue</b>\n\nEnter <b>Rental Item ID</b>:', { 
        parseMode: 'html' 
      });
    }

    // Help
    else if (data === 'help') {
      bot.sendMessage(chatId, `
<b>❓ Help Menu</b>

💡 I can help you:
• Rent items
• Manage rentals
• Return items
• Report issues
• View stats

📚 Commands:
/start - Show main menu
/help - Show this help
/status - Check bot status

For issues, use "Report Issue" option.
      `, { parseMode: 'html', markup: mainMenu });
    }

    bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, `❌ <b>Error</b>: ${error.message}`, { parseMode: 'html' });
  }
});

// ============================================================================
// Text Message Handler
// ============================================================================

bot.on('text', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const session = sessions[chatId];

  if (!session) return;

  try {
    if (session.action === 'rent') {
      await handleRentFlow(chatId, text, session);
    } 
    else if (session.action === 'return') {
      await handleReturnFlow(chatId, text, session);
    } 
    else if (session.action === 'dispute') {
      await handleDisputeFlow(chatId, text, session);
    }
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, `❌ <b>Error</b>: ${error.message}`, { parseMode: 'html' });
  }
});

// ============================================================================
// Rent Item Flow
// ============================================================================

async function handleRentFlow(chatId, input, session) {
  if (session.step === 1) {
    // Item ID
    if (isNaN(input)) {
      bot.sendMessage(chatId, '❌ Please enter a valid number');
      return;
    }
    
    session.itemId = parseInt(input);
    session.step = 2;
    bot.sendMessage(chatId, '💰 Enter <b>rental price</b> in TON (e.g., 2):', { 
      parseMode: 'html' 
    });
  } 
  else if (session.step === 2) {
    // Price
    if (isNaN(input)) {
      bot.sendMessage(chatId, '❌ Please enter a valid number');
      return;
    }
    
    session.price = parseFloat(input);
    session.step = 3;
    bot.sendMessage(chatId, '🏠 Enter <b>deposit amount</b> in TON (e.g., 5):', { 
      parseMode: 'html' 
    });
  } 
  else if (session.step === 3) {
    // Deposit
    if (isNaN(input)) {
      bot.sendMessage(chatId, '❌ Please enter a valid number');
      return;
    }
    
    session.deposit = parseFloat(input);
    session.step = 4;
    bot.sendMessage(chatId, '📅 Enter <b>rental duration</b> in days (e.g., 7):', { 
      parseMode: 'html' 
    });
  } 
  else if (session.step === 4) {
    // Duration & Summary
    if (isNaN(input)) {
      bot.sendMessage(chatId, '❌ Please enter a valid number');
      return;
    }
    
    session.duration = parseInt(input) * 24 * 60 * 60;
    const totalAmount = session.price + session.deposit + 0.1;
    
    // Create TON Connect transaction
    try {
      const transaction = tonService.createRentTransaction(
        session.itemId,
        OWNER_WALLET,
        session.price,
        session.deposit,
        session.duration
      );
      
      // Store transaction for tracking
      const txId = `rent_${chatId}_${Date.now()}`;
      pendingTransactions[txId] = {
        type: 'rent',
        chatId,
        itemId: session.itemId,
        price: session.price,
        deposit: session.deposit,
        duration: session.duration,
        transaction,
        createdAt: new Date()
      };
      
      // Generate TON transfer link
      const tonDeepLink = generateTONDeepLink(transaction);
      
      bot.sendMessage(chatId, `
✅ <b>Rental Summary</b>

📋 Item ID: #${session.itemId}
💰 Price: ${session.price} TON
🏠 Deposit: ${session.deposit} TON
📅 Duration: ${input} days
💵 Total: ${totalAmount.toFixed(2)} TON

🔐 <b>Payment Method:</b>
Use your TON wallet to complete the transaction.
Tap the button below to pay securely.
    `, {
        parseMode: 'html',
        markup: bot.inlineKeyboard([
          [bot.inlineButton('💳 Pay with TON Wallet', { url: tonDeepLink })],
          [bot.inlineButton('❓ Need Help?', { callback: 'help' })]
        ])
      });
      
    } catch (error) {
      console.error('Error creating transaction:', error);
      bot.sendMessage(chatId, `❌ <b>Error</b>: Failed to create transaction\n\n${error.message}`, { 
        parseMode: 'html' 
      });
    }
    
    delete sessions[chatId];
  }
}

// ============================================================================
// Return Item Flow
// ============================================================================

async function handleReturnFlow(chatId, input, session) {
  if (session.step === 1) {
    if (isNaN(input)) {
      bot.sendMessage(chatId, '❌ Please enter a valid item ID');
      return;
    }
    
    const itemId = parseInt(input);
    
    try {
      // Create TON Connect transaction for return
      const transaction = tonService.createReturnTransaction(itemId);
      
      // Store transaction for tracking
      const txId = `return_${chatId}_${Date.now()}`;
      pendingTransactions[txId] = {
        type: 'return',
        chatId,
        itemId,
        transaction,
        createdAt: new Date()
      };
      
      const tonDeepLink = generateTONDeepLink(transaction);
      
      bot.sendMessage(chatId, `
✅ <b>Return Item #${itemId}</b>

🔐 <b>Transaction Details:</b>
• Amount: 0.05 TON (gas fee)
• Status: Ready to confirm

Your deposit will be returned to your wallet upon successful verification.
      `, {
        parseMode: 'html',
        markup: bot.inlineKeyboard([
          [bot.inlineButton('✅ Confirm Return', { url: tonDeepLink })],
          [bot.inlineButton('❌ Cancel', { callback: 'cancel' })]
        ])
      });
      
    } catch (error) {
      console.error('Error creating return transaction:', error);
      bot.sendMessage(chatId, `❌ <b>Error</b>: ${error.message}`, { parseMode: 'html' });
    }
    
    delete sessions[chatId];
  }
}

// ============================================================================
// Dispute Flow
// ============================================================================

async function handleDisputeFlow(chatId, input, session) {
  if (session.step === 1) {
    if (isNaN(input)) {
      bot.sendMessage(chatId, '❌ Please enter a valid item ID');
      return;
    }
    
    session.itemId = parseInt(input);
    session.step = 2;
    bot.sendMessage(chatId, '📝 Describe the <b>issue</b> in detail:', { 
      parseMode: 'html' 
    });
  } 
  else if (session.step === 2) {
    const reason = input;
    
    try {
      // Create TON Connect transaction for dispute
      const transaction = tonService.createDisputeTransaction(session.itemId, reason);
      
      // Store transaction for tracking
      const txId = `dispute_${chatId}_${Date.now()}`;
      pendingTransactions[txId] = {
        type: 'dispute',
        chatId,
        itemId: session.itemId,
        reason,
        transaction,
        createdAt: new Date()
      };
      
      const tonDeepLink = generateTONDeepLink(transaction);
      
      bot.sendMessage(chatId, `
⚠️ <b>Dispute Report - Item #${session.itemId}</b>

<b>Issue Description:</b>
${reason}

<b>Transaction Details:</b>
• Amount: 0.05 TON (gas fee)
• Status: Ready to confirm

The owner will review your report and resolve the dispute fairly.
Average resolution time: 24 hours
      `, {
        parseMode: 'html',
        markup: bot.inlineKeyboard([
          [bot.inlineButton('📢 Submit Report', { url: tonDeepLink })],
          [bot.inlineButton('❌ Cancel', { callback: 'cancel' })]
        ])
      });
      
    } catch (error) {
      console.error('Error creating dispute transaction:', error);
      bot.sendMessage(chatId, `❌ <b>Error</b>: ${error.message}`, { parseMode: 'html' });
    }
    
    delete sessions[chatId];
  }
}

// ============================================================================
// View Rentals
// ============================================================================

async function handleViewRentals(chatId) {
  // In real app, fetch from contract
  const mockRentals = [
    { itemId: 1, item: 'Bike', price: 2, deposit: 5, daysLeft: 4 },
    { itemId: 2, item: 'Book', price: 0.5, deposit: 1, daysLeft: 2 }
  ];

  let message = '<b>📦 Your Active Rentals</b>\n\n';
  
  if (mockRentals.length === 0) {
    message += '❌ No active rentals\n\nClick "Rent Item" to get started!';
  } else {
    mockRentals.forEach((rental, idx) => {
      message += `${idx + 1}. <b>${rental.item}</b>\n`;
      message += `   💰 ${rental.price} TON / 📅 ${rental.daysLeft} days\n\n`;
    });
  }

  bot.sendMessage(chatId, message, { 
    parseMode: 'html',
    markup: mainMenu 
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate TON deep link for transaction
 */
function generateTONDeepLink(transaction) {
  // ton://transfer/ format for deep linking
  const params = new URLSearchParams({
    destination: transaction.address,
    amount: transaction.amount,
    text: 'Rental Marketplace Transaction',
    payload: transaction.payload
  });
  
  return `ton://transfer/${transaction.address}?${params.toString()}`;
}

/**
 * Get transaction status
 */
async function checkTransactionStatus(txId) {
  const pending = pendingTransactions[txId];
  if (!pending) return null;
  
  return {
    ...pending,
    age: Date.now() - pending.createdAt.getTime()
  };
}

/**
 * Clean up old pending transactions (older than 1 hour)
 */
function cleanupOldTransactions() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  for (const [txId, tx] of Object.entries(pendingTransactions)) {
    if (tx.createdAt.getTime() < oneHourAgo) {
      delete pendingTransactions[txId];
    }
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupOldTransactions, 30 * 60 * 1000);

// ============================================================================
// Error Handling
// ============================================================================

bot.on('error', (error) => {
  console.error('❌ Bot error:', error);
});

// ============================================================================
// Start Bot
// ============================================================================

bot.start();
console.log('✅ Bot is running!');
console.log(`📱 Bot Token: ${BOT_TOKEN.substring(0, 20)}...`);
console.log(`🏪 Contract: ${CONTRACT_ADDRESS}`);
console.log(`💼 Owner Wallet: ${OWNER_WALLET}`);
console.log(`🌐 Network: ${TON_NETWORK}`);
console.log(`\n🔗 TON Connect Service: Initialized`);
console.log(`💳 Transactions tracked: ${Object.keys(pendingTransactions).length}`);
console.log(`\n💡 Send /start to your bot on Telegram to test!`);

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Bot stopped');
  process.exit(0);
});
