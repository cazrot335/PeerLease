const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class UserDatabase {
  constructor(dbPath = './users.db') {
    this.db = new sqlite3.Database(dbPath);
    this.initDatabase();
  }

  /**
   * Initialize database tables
   */
  initDatabase() {
    this.db.serialize(() => {
      // Users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          telegram_id INTEGER UNIQUE NOT NULL,
          wallet_address TEXT UNIQUE,
          username TEXT,
          connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_active DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Items table (items owner has for rent)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          owner_wallet TEXT NOT NULL,
          item_name TEXT NOT NULL,
          description TEXT,
          price_per_day REAL,
          deposit_amount REAL,
          available BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(owner_wallet) REFERENCES users(wallet_address)
        )
      `);

      // Rentals table (tracking who rented what)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS rentals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id INTEGER NOT NULL,
          renter_wallet TEXT NOT NULL,
          owner_wallet TEXT NOT NULL,
          rental_start DATETIME DEFAULT CURRENT_TIMESTAMP,
          rental_end DATETIME,
          price_paid REAL,
          deposit_paid REAL,
          status TEXT DEFAULT 'active',
          transaction_hash TEXT,
          returned_at DATETIME,
          deposit_refunded BOOLEAN DEFAULT 0,
          FOREIGN KEY(item_id) REFERENCES items(id),
          FOREIGN KEY(renter_wallet) REFERENCES users(wallet_address),
          FOREIGN KEY(owner_wallet) REFERENCES users(wallet_address)
        )
      `);

      // Disputes table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS disputes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          rental_id INTEGER NOT NULL,
          reported_by_wallet TEXT NOT NULL,
          reason TEXT,
          status TEXT DEFAULT 'open',
          resolution TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          resolved_at DATETIME,
          FOREIGN KEY(rental_id) REFERENCES rentals(id),
          FOREIGN KEY(reported_by_wallet) REFERENCES users(wallet_address)
        )
      `);

      // User sessions (for wallet connection)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          telegram_id INTEGER UNIQUE NOT NULL,
          wallet_address TEXT,
          session_token TEXT UNIQUE,
          expires_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(telegram_id) REFERENCES users(telegram_id)
        )
      `);
    });
  }

  /**
   * Add or update user
   */
  async addUser(telegramId, username) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR IGNORE INTO users (telegram_id, username) VALUES (?, ?)`,
        [telegramId, username],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Connect wallet to user
   */
  async connectWallet(telegramId, walletAddress) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET wallet_address = ?, last_active = CURRENT_TIMESTAMP WHERE telegram_id = ?`,
        [walletAddress, telegramId],
        function(err) {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
  }

  /**
   * Get user by telegram ID
   */
  async getUserByTelegramId(telegramId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM users WHERE telegram_id = ?`,
        [telegramId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Get user by wallet address
   */
  async getUserByWallet(walletAddress) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM users WHERE wallet_address = ?`,
        [walletAddress],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Add item to rental marketplace
   */
  async addItem(ownerWallet, itemName, description, pricePerDay, depositAmount) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO items (owner_wallet, item_name, description, price_per_day, deposit_amount)
         VALUES (?, ?, ?, ?, ?)`,
        [ownerWallet, itemName, description, pricePerDay, depositAmount],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Get all available items
   */
  async getAvailableItems() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM items WHERE available = 1`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Get items owned by user
   */
  async getOwnedItems(ownerWallet) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM items WHERE owner_wallet = ?`,
        [ownerWallet],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Create rental record
   */
  async createRental(itemId, renterWallet, ownerWallet, durationDays, pricePaid, depositPaid, txHash) {
    return new Promise((resolve, reject) => {
      const rentalEnd = new Date();
      rentalEnd.setDate(rentalEnd.getDate() + durationDays);

      this.db.run(
        `INSERT INTO rentals (item_id, renter_wallet, owner_wallet, rental_end, price_paid, deposit_paid, transaction_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [itemId, renterWallet, ownerWallet, rentalEnd.toISOString(), pricePaid, depositPaid, txHash],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Get active rentals for a user (renting)
   */
  async getActiveRentalsForRenter(renterWallet) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT r.*, i.item_name, i.price_per_day, u.username as owner_name
         FROM rentals r
         JOIN items i ON r.item_id = i.id
         JOIN users u ON r.owner_wallet = u.wallet_address
         WHERE r.renter_wallet = ? AND r.status = 'active'
         ORDER BY r.rental_end ASC`,
        [renterWallet],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Get active rentals for items owned by user
   */
  async getActiveRentalsForOwner(ownerWallet) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT r.*, i.item_name, u.username as renter_name
         FROM rentals r
         JOIN items i ON r.item_id = i.id
         JOIN users u ON r.renter_wallet = u.wallet_address
         WHERE r.owner_wallet = ? AND r.status = 'active'
         ORDER BY r.rental_end ASC`,
        [ownerWallet],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Complete rental (return item)
   */
  async completeRental(rentalId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE rentals SET status = 'completed', returned_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [rentalId],
        function(err) {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
  }

  /**
   * Refund deposit
   */
  async refundDeposit(rentalId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE rentals SET deposit_refunded = 1 WHERE id = ?`,
        [rentalId],
        function(err) {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
  }

  /**
   * Report dispute
   */
  async reportDispute(rentalId, reportedByWallet, reason) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO disputes (rental_id, reported_by_wallet, reason) VALUES (?, ?, ?)`,
        [rentalId, reportedByWallet, reason],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Get disputes for user
   */
  async getDisputesForUser(walletAddress) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT d.*, r.item_id, i.item_name
         FROM disputes d
         JOIN rentals r ON d.rental_id = r.id
         JOIN items i ON r.item_id = i.id
         WHERE d.reported_by_wallet = ? OR r.owner_wallet = ? OR r.renter_wallet = ?
         ORDER BY d.created_at DESC`,
        [walletAddress, walletAddress, walletAddress],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Get rental stats for user
   */
  async getRentalStats(walletAddress) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT
          (SELECT COUNT(*) FROM rentals WHERE renter_wallet = ? AND status = 'active') as active_rentals,
          (SELECT COUNT(*) FROM rentals WHERE owner_wallet = ? AND status = 'active') as items_rented_out,
          (SELECT COUNT(*) FROM rentals WHERE renter_wallet = ? AND status = 'completed') as completed_rentals,
          (SELECT COUNT(*) FROM items WHERE owner_wallet = ?) as total_items,
          (SELECT SUM(price_paid) FROM rentals WHERE owner_wallet = ? AND status = 'completed') as total_earned
        `,
        [walletAddress, walletAddress, walletAddress, walletAddress, walletAddress],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || {});
        }
      );
    });
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }
}

module.exports = UserDatabase;
