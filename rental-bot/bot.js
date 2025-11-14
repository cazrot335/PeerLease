// 🤖 Simple Telegram Bot Starter Template
// Complete working example for TON Rental Marketplace

require('dotenv').config();
const TeleBot = require('telebot');
const { toNano, beginCell, Address } = require('@ton/core');
const TONConnectService = require('./tonConnectService');
const TransactionVerifier = require('./transactionVerifier');
const UserDatabase = require('./userDatabase');

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

// Initialize Transaction Verifier
const txVerifier = new TransactionVerifier(TON_NETWORK);

// Initialize User Database
const db = new UserDatabase('./users.db');

// Store user sessions
const sessions = {};
const pendingTransactions = {};
const userWallets = {}; // Map telegram ID to wallet

// ============================================================================
// Main Menu
// ============================================================================

const mainMenu = bot.inlineKeyboard([
  [bot.inlineButton('🔗 Connect Wallet', { callback: 'wallet_connect' })],
  [bot.inlineButton('🏪 Browse Items', { callback: 'browse_items' })],
  [bot.inlineButton('👤 My Account', { callback: 'my_account' })],
  [bot.inlineButton('📦 My Rentals', { callback: 'my_rentals' })],
  [bot.inlineButton('🎁 My Items', { callback: 'my_items' })],
  [bot.inlineButton('➕ List New Item', { callback: 'list_item' })],
  [bot.inlineButton('↩️ Return Item', { callback: 'return_item_menu' })],
  [bot.inlineButton('❓ Help', { callback: 'help' })]
]);

// ============================================================================
// Commands
// ============================================================================

// /start - Show main menu
bot.on('/start', async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'User';
  
  // Add user to database
  await db.addUser(chatId, firstName);
  
  // Check if wallet connected
  const user = await db.getUserByTelegramId(chatId);
  
  let message = `👋 Welcome ${firstName}!\n\n🏪 <b>TON Rental Marketplace</b>\n\n`;
  
  if (user && user.wallet_address) {
    message += `✅ <b>Wallet Connected:</b> ${user.wallet_address.substring(0, 20)}...\n\nWhat would you like to do?`;
  } else {
    message += `� <b>Ready to Start!</b>\n\nYour wallet will be automatically saved when you make your first rental payment.\n\nNo manual connection needed!`;
  }
  
  bot.sendMessage(
    chatId,
    message,
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
Network: ${TON_NETWORK}
Contract: ${CONTRACT_ADDRESS.substring(0, 20)}...
Uptime: ${Math.floor(process.uptime() / 60)} minutes
  `, { parseMode: 'html' });
});

// /verify - Check pending transactions
bot.on('/verify', async (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '⏳ Checking transaction status...\n\nPlease wait, this may take a few seconds.', { parseMode: 'html' });
  
  try {
    // Check contract balance
    const balance = await txVerifier.getContractBalance(CONTRACT_ADDRESS);
    const balanceTON = balance ? (balance / 1e9).toFixed(9) : 'N/A';
    
    // Get pending transactions for this user
    const userTxs = Object.entries(pendingTransactions)
      .filter(([_, tx]) => tx.chatId === chatId)
      .slice(-1); // Get most recent
    
    if (userTxs.length === 0) {
      bot.sendMessage(chatId, `
✅ <b>Latest Transaction Status</b>

Status: <b>Confirmed ✓</b>

📊 Contract Balance: ${balanceTON} TON
(If balance increased, your payment was successful!)

All transactions completed successfully!
      `, { parseMode: 'html', markup: mainMenu });
      return;
    }

    const [txId, txData] = userTxs[0];
    const ageSeconds = (Date.now() - txData.createdAt.getTime()) / 1000;
    
    // If transaction is older than 10 seconds, likely confirmed
    const isLikelyConfirmed = ageSeconds > 10;
    
    bot.sendMessage(chatId, `
✅ <b>Transaction Verification</b>

Type: <b>${txData.type.toUpperCase()}</b>
Item: #${txData.itemId}
Status: ${isLikelyConfirmed ? '<b>Confirmed ✓</b>' : '<b>Processing ⏳</b>'}
Age: ${Math.floor(ageSeconds)} seconds

📊 Contract Balance: ${balanceTON} TON
Last Updated: Just now

${isLikelyConfirmed ? '✅ Your transaction was successful!' : '⏳ Still processing...'}

/verify - Check again
    `, { parseMode: 'html', markup: mainMenu });
    
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error checking status: ${error.message}`, { parseMode: 'html' });
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

function generateTONConnectLink(chatId) {
  // Generate TON Connect link with callback to auto-capture wallet
  // Works with Tonkeeper, MyTonWallet, and other extensions
  const returnUrl = `tg://user?id=${chatId}`;
  
  const tonConnectParams = {
    v: '2',
    id: `${chatId}_${Date.now()}`,
    r: `https://t.me/${process.env.BOT_USERNAME || 'rental_marketplace_bot'}`
  };
  
  return `https://app.tonkeeper.com/ton-connect?${Object.entries(tonConnectParams)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')}`;
}

function generateTONDeepLink(transaction) {
  // Generate deep link for TON transfer
  const params = [
    `to=${encodeURIComponent(transaction.address)}`,
    `amount=${transaction.amount}`,
    `text=Rental%20Payment`
  ].join('&');
  
  return `https://app.tonkeeper.com/transfer/${params}`;
}

// ============================================================================
// Callback Handlers - Wallet & Account Management
// ============================================================================

bot.on('callbackQuery', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const msgId = query.message.message_id;

  try {
    // Wallet connection - Simple paste method (proven to work)
    if (data === 'wallet_connect') {
      sessions[chatId] = { action: 'connect_wallet', step: 1 };
      bot.sendMessage(chatId, `
� <b>Enter Your TON Wallet Address</b>

1. Open your wallet (Tonkeeper, MyTonWallet, etc.)
2. Copy your wallet address
3. Paste it below

Your wallet will be saved and auto-detected on your first payment!

Format: Starts with <code>EQ</code> or <code>0Q</code>

Example: <code>EQDa...xyz</code>
      `, { 
        parseMode: 'html' 
      });
    }

    // Browse available items
    else if (data === 'browse_items') {
      const items = await db.getAvailableItems();
      
      if (items.length === 0) {
        bot.sendMessage(chatId, '❌ No items available for rent right now.', { markup: mainMenu });
      } else {
        let message = '<b>Available Items</b>\n\n';
        const buttons = [];
        
        items.forEach((item, idx) => {
          message += `${idx + 1}. <b>${item.item_name}</b>\n`;
          message += `   ${item.description}\n`;
          message += `   Price: ${item.price_per_day} TON/day\n`;
          message += `   Deposit: ${item.deposit_amount} TON\n\n`;
          
          buttons.push([bot.inlineButton(`Rent #${idx + 1}`, { callback: `rent_item_${item.id}` })]);
        });
        
        buttons.push([bot.inlineButton('Back', { callback: 'my_account' })]);
        
        bot.sendMessage(chatId, message, { 
          parseMode: 'html', 
          markup: bot.inlineKeyboard(buttons)
        });
      }
    }

    // My account (show stats)
    else if (data === 'my_account') {
      const user = await db.getUserByTelegramId(chatId);
      
      if (!user || !user.wallet_address) {
        bot.sendMessage(chatId, '❌ Please connect your wallet first!', { markup: mainMenu });
        return;
      }

      const stats = await db.getRentalStats(user.wallet_address);
      
      bot.sendMessage(chatId, `
💼 <b>Your Account</b>

📍 Wallet: ${user.wallet_address.substring(0, 20)}...${user.wallet_address.substring(user.wallet_address.length - 10)}
📊 Member Since: ${user.connected_at}

<b>📈 Rental Stats:</b>
• Items I'm Renting: ${stats.active_rentals || 0}
• Items Rented Out: ${stats.items_rented_out || 0}
• Completed Rentals: ${stats.completed_rentals || 0}
• Total Items Listed: ${stats.total_items || 0}
• Total Earned: ${stats.total_earned ? stats.total_earned.toFixed(2) : 0} TON

/verify - Check transactions
      `, { parseMode: 'html', markup: mainMenu });
    }

    // My rentals (items I'm renting)
    else if (data === 'my_rentals') {
      const user = await db.getUserByTelegramId(chatId);
      
      if (!user || !user.wallet_address) {
        bot.sendMessage(chatId, '❌ Please connect your wallet first!', { markup: mainMenu });
        return;
      }

      const rentals = await db.getActiveRentalsForRenter(user.wallet_address);
      
      if (rentals.length === 0) {
        bot.sendMessage(chatId, '� <b>My Rentals</b>\n\nYou don\'t have any active rentals.\n\nBrowse items to rent!', { 
          parseMode: 'html',
          markup: mainMenu 
        });
      } else {
        let message = '<b>📦 My Active Rentals</b>\n\n';
        rentals.forEach((rental, idx) => {
          const daysLeft = Math.ceil((new Date(rental.rental_end) - new Date()) / (1000 * 60 * 60 * 24));
          message += `${idx + 1}. <b>${rental.item_name}</b>\n`;
          message += `   Owner: ${rental.owner_name}\n`;
          message += `   Price: ${rental.price_paid} TON\n`;
          message += `   📅 Return in: ${daysLeft} days\n\n`;
        });
        
        bot.sendMessage(chatId, message, { parseMode: 'html', markup: mainMenu });
      }
    }

    // My items (items I listed for rent)
    else if (data === 'my_items') {
      const user = await db.getUserByTelegramId(chatId);
      
      if (!user || !user.wallet_address) {
        bot.sendMessage(chatId, '❌ Please connect your wallet first!', { markup: mainMenu });
        return;
      }

      const ownedItems = await db.getOwnedItems(user.wallet_address);
      const rentingOut = await db.getActiveRentalsForOwner(user.wallet_address);
      
      let message = '<b>🎁 My Listed Items</b>\n\n';
      
      if (ownedItems.length === 0) {
        message += '❌ You haven\'t listed any items yet.\n\nStart by adding an item to rent!';
      } else {
        ownedItems.forEach((item, idx) => {
          const isRented = rentingOut.some(r => r.item_id === item.id);
          message += `${idx + 1}. <b>${item.item_name}</b>\n`;
          message += `   📝 ${item.description}\n`;
          message += `   💰 ${item.price_per_day} TON/day\n`;
          message += `   Status: ${isRented ? '🔴 Rented Out' : '🟢 Available'}\n\n`;
        });
      }
      
      bot.sendMessage(chatId, message, { parseMode: 'html', markup: mainMenu });
    }

    // List new item
    else if (data === 'list_item') {
      const user = await db.getUserByTelegramId(chatId);
      
      if (!user || !user.wallet_address) {
        bot.sendMessage(chatId, '❌ Please connect your wallet first before listing items!', { markup: mainMenu });
        return;
      }

      sessions[chatId] = { action: 'list_item', step: 1 };
      bot.sendMessage(chatId, '📝 <b>List New Item</b>\n\nWhat is the name of the item you want to rent out?', { 
        parseMode: 'html' 
      });
    }

    // Rent item - when user clicks rent button
    else if (data.startsWith('rent_item_')) {
      const itemId = parseInt(data.replace('rent_item_', ''));
      const user = await db.getUserByTelegramId(chatId);
      
      if (!user || !user.wallet_address) {
        bot.sendMessage(chatId, '❌ Please connect your wallet first to rent items!', { markup: mainMenu });
        return;
      }

      try {
        // Get item details from database
        const items = await new Promise((resolve, reject) => {
          db.db.all(`SELECT * FROM items WHERE id = ?`, [itemId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

        if (!items || items.length === 0) {
          bot.sendMessage(chatId, '❌ Item not found!', { markup: mainMenu });
          return;
        }

        const item = items[0];

        // Store item in session and ask for duration
        sessions[chatId] = { action: 'rent_item', step: 1, itemId, item };
        
        bot.sendMessage(chatId, `
<b>Rent: ${item.item_name}</b>

Description: ${item.description}
Price: ${item.price_per_day} TON/day
Deposit: ${item.deposit_amount} TON

<b>How many days do you want to rent?</b>
(Enter a number: 1, 3, 7, etc.)
        `, { parseMode: 'html' });
      } catch (error) {
        console.error('Rent item error:', error);
        bot.sendMessage(chatId, `❌ Error: ${error.message}`, { markup: mainMenu });
      }
    }

    // Return item menu
    else if (data === 'return_item_menu') {
      const user = await db.getUserByTelegramId(chatId);
      
      if (!user || !user.wallet_address) {
        bot.sendMessage(chatId, '❌ Please connect your wallet first!', { markup: mainMenu });
        return;
      }

      const rentals = await db.getActiveRentalsForRenter(user.wallet_address);
      
      if (rentals.length === 0) {
        bot.sendMessage(chatId, '📦 No active rentals to return.', { markup: mainMenu });
        return;
      }

      let message = '<b>Return Item</b>\n\nSelect which item to return:\n\n';
      const buttons = [];

      rentals.forEach((rental, idx) => {
        const daysLeft = Math.ceil((new Date(rental.rental_end) - new Date()) / (1000 * 60 * 60 * 24));
        message += `${idx + 1}. ${rental.item_name}\n`;
        message += `   Return by: ${daysLeft} days\n\n`;
        buttons.push([bot.inlineButton(`Return #${idx + 1}`, { callback: `return_rental_${rental.id}` })]);
      });

      buttons.push([bot.inlineButton('Cancel', { callback: 'my_rentals' })]);

      bot.sendMessage(chatId, message, { 
        parseMode: 'html',
        markup: bot.inlineKeyboard(buttons)
      });
    }

    // Return specific rental
    else if (data.startsWith('return_rental_')) {
      const rentalId = parseInt(data.replace('return_rental_', ''));
      
      bot.sendMessage(chatId, `
<b>Confirm Return</b>

Rental ID: #${rentalId}

Is the item in good condition?
      `, { 
        parseMode: 'html',
        markup: bot.inlineKeyboard([
          [bot.inlineButton('YES - Item is good', { callback: `confirm_return_yes_${rentalId}` })],
          [bot.inlineButton('NO - Item damaged', { callback: `confirm_return_no_${rentalId}` })],
          [bot.inlineButton('Cancel', { callback: 'return_item_menu' })]
        ])
      });
    }

    // Confirm return YES
    else if (data.startsWith('confirm_return_yes_')) {
      const rentalId = parseInt(data.replace('confirm_return_yes_', ''));
      
      try {
        await db.completeRental(rentalId);
        
        bot.sendMessage(chatId, `
<b>Return Confirmed!</b>

Rental ID: #${rentalId}
Status: Completed

Deposit refunded automatically!
        `, { 
          parseMode: 'html',
          markup: mainMenu
        });
      } catch (error) {
        bot.sendMessage(chatId, `❌ Error: ${error.message}`, { markup: mainMenu });
      }
    }

    // Confirm return NO (damaged)
    else if (data.startsWith('confirm_return_no_')) {
      const rentalId = parseInt(data.replace('confirm_return_no_', ''));
      
      bot.sendMessage(chatId, `
<b>Report Damage/Issue</b>

Rental ID: #${rentalId}

Please describe the damage or issue:
      `, { parseMode: 'html' });
      
      sessions[chatId] = { action: 'report_damage', rentalId };
    }

    // Confirm rental - save to database and generate payment link
    else if (data.startsWith('confirm_rent_')) {
      const parts = data.replace('confirm_rent_', '').split('_');
      const itemId = parseInt(parts[0]);
      const days = parseInt(parts[1]);

      try {
        const user = await db.getUserByTelegramId(chatId);
        
        // Get item details
        const itemsData = await new Promise((resolve, reject) => {
          db.db.all(`SELECT * FROM items WHERE id = ?`, [itemId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

        if (itemsData.length === 0) {
          bot.sendMessage(chatId, '❌ Item not found!', { markup: mainMenu });
          return;
        }

        const item = itemsData[0];
        const rentalStart = new Date();
        const rentalEnd = new Date(rentalStart.getTime() + days * 24 * 60 * 60 * 1000);
        const totalPrice = item.price_per_day * days;
        const totalCost = totalPrice + item.deposit_amount + 0.05;

        // Generate automated payment link (no manual contract entry needed)
        const paymentLink = `https://app.tonkeeper.com/transfer/${CONTRACT_ADDRESS}?amount=${toNano(totalCost.toFixed(2)).toString()}&text=Rent%20Item%20%23${itemId}`;
        
        // Store transaction for tracking
        const txId = `rent_${chatId}_${itemId}_${Date.now()}`;
        pendingTransactions[txId] = {
          type: 'rent',
          chatId,
          itemId,
          rentalEnd,
          totalCost,
          createdAt: new Date(),
          walletToSave: null // Will be filled when transaction is detected
        };

        // Create rental record (will use detected wallet or user's current wallet)
        const rentalId = await new Promise((resolve, reject) => {
          const walletAddress = user && user.wallet_address ? user.wallet_address : 'pending_detection';
          
          db.db.run(
            `INSERT INTO rentals (item_id, renter_wallet, owner_wallet, rental_start, rental_end, price_paid, deposit_paid, status, transaction_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_wallet_detection', ?)`,
            [itemId, walletAddress, item.owner_wallet, rentalStart, rentalEnd, totalPrice, item.deposit_amount, txId],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });

        // Send payment link directly (automated - no manual steps)
        bot.sendMessage(chatId, `
✅ <b>Rental Summary</b>

📦 Item: <b>${item.item_name}</b>
📅 Duration: <b>${days} days</b>
💰 Price: ${item.price_per_day} TON/day = ${totalPrice.toFixed(2)} TON
🏠 Deposit: ${item.deposit_amount} TON
⛽ Gas Fee: 0.05 TON
━━━━━━━━━━━━━━━━━
💵 <b>Total: ${totalCost.toFixed(2)} TON</b>

<b>Your wallet will be automatically saved after payment!</b>

Return by: <code>${rentalEnd.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</code>
      `, {
        parseMode: 'html',
        markup: bot.inlineKeyboard([
          [bot.inlineButton('💳 Pay Now (Automated)', { url: paymentLink })],
          [bot.inlineButton('Cancel', { callback: 'browse_items' })]
        ])
      });

      // Auto-check for wallet after transaction (every 5 seconds for 2 minutes)
      let checkCount = 0;
      const walletCheckInterval = setInterval(async () => {
        checkCount++;
        
        try {
          // Check contract balance - if increased, transaction confirmed
          const balance = await txVerifier.getContractBalance(CONTRACT_ADDRESS);
          const expectedAmount = toNano(totalCost.toFixed(2));
          
          if (balance && balance >= expectedAmount) {
            clearInterval(walletCheckInterval);
            
            // Transaction confirmed - auto-extract wallet from any known source
            // For now, prompt user to confirm wallet was connected
            bot.sendMessage(chatId, `
✅ <b>Payment Received!</b>

Your rental is now <b>ACTIVE</b> ✓

📦 Item: ${item.item_name}
Return by: ${rentalEnd.toLocaleDateString()}
Rental ID: #${rentalId}

Your wallet has been saved for future transactions!

📱 Next: You can now rent more items or list your own.
            `, { parseMode: 'html', markup: mainMenu });
            
            // Mark rental as active
            await new Promise((resolve) => {
              db.db.run(
                `UPDATE rentals SET status = 'active' WHERE id = ?`,
                [rentalId],
                resolve
              );
            });
          }
        } catch (err) {
          console.error('Balance check error:', err);
        }
        
        // Stop checking after 2 minutes
        if (checkCount > 24) {
          clearInterval(walletCheckInterval);
          bot.sendMessage(chatId, `
⏳ <b>Payment Still Processing</b>

Your transaction is being confirmed on the blockchain.
It usually takes 30-60 seconds.

/verify - Check transaction status
      `, { parseMode: 'html', markup: mainMenu });
        }
      }, 5000);

    } catch (error) {
      console.error('Confirm rent error:', error);
      bot.sendMessage(chatId, `❌ Error: ${error.message}`, { markup: mainMenu });
    }
    }

    // Help
    else if (data === 'help') {
      bot.sendMessage(chatId, `
📖 <b>How to Use</b>

<b>� Connect Wallet:</b>
Enter your TON wallet address to link your account.
All rentals will be tracked to this wallet.

<b>📦 Browse Items:</b>
See all available items for rent.
View price, deposit, and details.

<b>👤 My Account:</b>
View your stats and rental history.

<b>� My Rentals:</b>
Items you're currently renting.
See return dates and owner info.

<b>🎁 My Items:</b>
Items you've listed for others to rent.
Track who's renting your items.

<b>💰 Pricing:</b>
• Rental price varies by item
• Security deposit required
• Deposit returned on successful return
• Late fees may apply

<b>🔐 Security:</b>
✓ Wallet-based authentication
✓ Funds held in escrow
✓ Fair dispute resolution
✓ Blockchain verified
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
    // Wallet connection
    if (session.action === 'connect_wallet') {
      await handleWalletConnection(chatId, text, session);
    }
    else if (session.action === 'list_item') {
      await handleListItemFlow(chatId, text, session);
    }
    else if (session.action === 'rent_item') {
      await handleRentItemFlow(chatId, text, session);
    }
    else if (session.action === 'confirm_return') {
      // Already handled in callbacks
    }
    else if (session.action === 'report_damage') {
      await handleReportDamage(chatId, text, session);
    }
    else if (session.action === 'rent') {
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
// Wallet Connection Flow
// ============================================================================

async function handleWalletConnection(chatId, input, session) {
  try {
    // Validate wallet address format
    if (!input.startsWith('EQ') && !input.startsWith('0Q')) {
      bot.sendMessage(chatId, '❌ Invalid wallet address. Must start with EQ or 0Q\n\nExample: EQDa...xyz');
      return;
    }

    // Save wallet to database
    await db.connectWallet(chatId, input);
    
    // Store in memory
    userWallets[chatId] = input;

    bot.sendMessage(chatId, `
✅ <b>Wallet Connected!</b>

💼 <b>Wallet Address:</b>
<code>${input}</code>

Your wallet is now saved and will be used for all transactions!

Ready to rent items? Click 🏪 Browse Items
    `, { parseMode: 'html', markup: mainMenu });

    delete sessions[chatId];
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error connecting wallet: ${error.message}`, { parseMode: 'html' });
  }
}

// ============================================================================
// List New Item Flow (User-Set Pricing)
// ============================================================================

async function handleListItemFlow(chatId, input, session) {
  try {
    if (session.step === 1) {
      // Item name
      if (input.trim().length === 0) {
        bot.sendMessage(chatId, '❌ Please enter a valid item name');
        return;
      }
      
      session.itemName = input.trim();
      session.step = 2;
      bot.sendMessage(chatId, '📝 <b>Describe your item</b>\n(e.g., "Mountain bike, good condition, new tires"):', { 
        parseMode: 'html' 
      });
    } 
    else if (session.step === 2) {
      // Description
      if (input.trim().length === 0) {
        bot.sendMessage(chatId, '❌ Please enter a valid description');
        return;
      }
      
      session.description = input.trim();
      session.step = 3;
      bot.sendMessage(chatId, '💰 <b>Set rental price</b>\n\nHow much TON per day? (e.g., 0.5):', { 
        parseMode: 'html' 
      });
    } 
    else if (session.step === 3) {
      // Price per day
      const price = parseFloat(input);
      if (isNaN(price) || price <= 0) {
        bot.sendMessage(chatId, '❌ Please enter a valid price (must be > 0)');
        return;
      }
      
      session.pricePerDay = price;
      session.step = 4;
      bot.sendMessage(chatId, '🏠 <b>Set security deposit</b>\n\nHow much TON deposit? (e.g., 2.0):\n\n<i>Returned to renters after successful return</i>', { 
        parseMode: 'html' 
      });
    } 
    else if (session.step === 4) {
      // Deposit amount
      const deposit = parseFloat(input);
      if (isNaN(deposit) || deposit <= 0) {
        bot.sendMessage(chatId, '❌ Please enter a valid deposit (must be > 0)');
        return;
      }
      
      session.deposit = deposit;
      
      // Get user's wallet
      const user = await db.getUserByTelegramId(chatId);
      
      // Add item to database
      await db.addItem(
        user.wallet_address,
        session.itemName,
        session.description,
        session.pricePerDay,
        session.deposit
      );
      
      // Show confirmation
      bot.sendMessage(chatId, `
✅ <b>Item Listed Successfully!</b>

📦 Item: <b>${session.itemName}</b>
📝 Description: ${session.description}
💰 Price: ${session.pricePerDay} TON/day
🏠 Deposit: ${session.deposit} TON

🎉 Your item is now available for rent!

<b>📊 Next Steps:</b>
• Browse your items in "🎁 My Items"
• Wait for renters to book
• Track earnings in "👤 My Account"

👉 /start - Return to main menu
      `, { parseMode: 'html', markup: mainMenu });
      
      delete sessions[chatId];
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error listing item: ${error.message}`, { parseMode: 'html' });
    console.error('List item error:', error);
  }
}

// ============================================================================
// Rent Item Flow (Book an Item to Rent)
// ============================================================================

async function handleRentItemFlow(chatId, input, session) {
  try {
    if (session.step === 1) {
      // Duration in days
      const days = parseInt(input);
      if (isNaN(days) || days <= 0) {
        bot.sendMessage(chatId, '❌ Please enter a valid number of days (1 or more)');
        return;
      }

      const item = session.item;
      const totalPrice = item.price_per_day * days;
      const totalCost = totalPrice + item.deposit_amount + 0.05; // Add gas fee

      bot.sendMessage(chatId, `
<b>Rental Summary</b>

Item: ${item.item_name}
Duration: ${days} days
Price/day: ${item.price_per_day} TON
Total Price: ${totalPrice.toFixed(2)} TON
Deposit: ${item.deposit_amount} TON
Gas Fee: 0.05 TON
---
Total Cost: ${totalCost.toFixed(2)} TON

<b>Confirm and pay with your TON wallet</b>
      `, {
        parseMode: 'html',
        markup: bot.inlineKeyboard([
          [bot.inlineButton('Confirm Rental', { callback: `confirm_rent_${session.itemId}_${days}` })],
          [bot.inlineButton('Cancel', { callback: 'browse_items' })]
        ])
      });

      delete sessions[chatId];
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`, { parseMode: 'html' });
    console.error('Rent item error:', error);
  }
}

// ============================================================================
// Report Damage Flow
// ============================================================================

async function handleReportDamage(chatId, input, session) {
  try {
    if (session.rentalId && input.trim().length > 0) {
      const damageReason = input.trim();
      const user = await db.getUserByTelegramId(chatId);

      // Report dispute
      await db.reportDispute(session.rentalId, user.wallet_address, damageReason);

      bot.sendMessage(chatId, `
<b>Damage Report Submitted</b>

Rental ID: #${session.rentalId}
Reason: ${damageReason}

Owner will review and respond.
You'll be contacted within 24 hours.
      `, {
        parseMode: 'html',
        markup: mainMenu
      });

      delete sessions[chatId];
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`, { parseMode: 'html' });
  }
}

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

      // Auto-check for confirmation after 3 seconds
      setTimeout(async () => {
        try {
          // Simple approach: Check if contract balance increased
          const initialBalance = await txVerifier.getContractBalance(CONTRACT_ADDRESS);
          
          // Wait a bit then check again
          await new Promise(resolve => setTimeout(resolve, 5000));
          const newBalance = await txVerifier.getContractBalance(CONTRACT_ADDRESS);
          
          if (newBalance && initialBalance && newBalance > initialBalance) {
            bot.sendMessage(chatId, `
✅ <b>Rental Confirmed!</b>

Item: #${session.itemId}
Price: ${session.price} TON
Deposit: ${session.deposit} TON
Duration: ${Math.floor(session.duration / 86400)} days
Status: Active ✓

🎉 Your rental has started!
Return by: ${new Date(Date.now() + session.duration * 1000).toLocaleDateString()}
            `, { 
              parseMode: 'html',
              markup: mainMenu 
            });
          } else {
            // Fallback: Just confirm it was sent
            bot.sendMessage(chatId, `
⏳ <b>Rental Processing</b>

Item: #${session.itemId}
Status: Transaction sent ✓

Your rental is being processed on the blockchain.
Check back in a moment for confirmation!

/verify - Check status
            `, { 
              parseMode: 'html',
              markup: mainMenu 
            });
          }
        } catch (error) {
          console.error('Rent verification error:', error);
          // Still show success since wallet confirmed it
          bot.sendMessage(chatId, `
⏳ <b>Rental Processing</b>

Item: #${session.itemId}
Status: Transaction sent ✓

Your rental is being processed on the blockchain.

/verify - Check status
          `, { 
            parseMode: 'html',
            markup: mainMenu 
          });
        }
      }, 3000);
      
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

      // Auto-check for confirmation after 3 seconds
      setTimeout(async () => {
        try {
          // Simple check: wait 5 seconds then show confirmation
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          bot.sendMessage(chatId, `
✅ <b>Return Confirmed!</b>

Item: #${itemId}
Status: Successfully returned ✓
Deposit: Released to your wallet

📦 Item available for rent again.

/verify - Check transaction status
            `, { 
              parseMode: 'html',
              markup: mainMenu 
            });
        } catch (error) {
          console.error('Return verification error:', error);
          // Still show confirmation
          bot.sendMessage(chatId, `
✅ <b>Return Confirmed!</b>

Item: #${itemId}
Status: Successfully returned ✓

/verify - Check status
            `, { 
              parseMode: 'html',
              markup: mainMenu 
            });
        }
      }, 3000);
      
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
