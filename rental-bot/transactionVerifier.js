const axios = require('axios');

class TransactionVerifier {
  constructor(network = 'testnet') {
    this.network = network;
    this.apiBase = network === 'testnet' 
      ? 'https://testnet.toncenter.com/api/v2'
      : 'https://toncenter.com/api/v2';
    this.maxRetries = 30; // Try for 5 minutes (30 * 10 seconds)
    this.retryInterval = 10000; // 10 seconds
  }

  /**
   * Wait for transaction to be confirmed on blockchain
   */
  async waitForTransaction(walletAddress, expectedAmount, timeoutSeconds = 300) {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;
    let attempts = 0;

    while (attempts < this.maxRetries) {
      try {
        // Get latest transactions for wallet
        const transactions = await this.getWalletTransactions(walletAddress);
        
        if (transactions && transactions.length > 0) {
          // Check if any recent transaction matches
          const confirmed = transactions.find(tx => {
            const isRecent = (Date.now() - tx.timestamp * 1000) < 120000; // Last 2 minutes
            // Be flexible with amount matching (within 10% or 0.5 TON)
            const amountDifference = Math.abs(tx.amount - expectedAmount);
            const amountMatches = amountDifference < Math.max(expectedAmount * 0.1, 500000000);
            return isRecent && amountMatches;
          });

          if (confirmed) {
            console.log(`✅ Transaction confirmed: ${confirmed.txHash || 'pending'}`);
            return {
              confirmed: true,
              txHash: confirmed.txHash || 'unknown',
              timestamp: confirmed.timestamp,
              attempts: attempts,
              amount: confirmed.amount
            };
          }
        }

        // Check timeout
        if (Date.now() - startTime > timeoutMs) {
          console.log(`⏳ Transaction verification timed out after ${attempts} attempts`);
          return {
            confirmed: false,
            error: 'Transaction timeout - not found on blockchain',
            attempts: attempts
          };
        }

        // Wait before retry
        console.log(`⏳ Checking transaction... (attempt ${attempts + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryInterval));
        attempts++;

      } catch (error) {
        console.error('Error verifying transaction:', error);
        
        if (Date.now() - startTime > timeoutMs) {
          return {
            confirmed: false,
            error: error.message,
            attempts: attempts
          };
        }

        await new Promise(resolve => setTimeout(resolve, this.retryInterval));
        attempts++;
      }
    }

    console.log(`⏳ Max retries exceeded after ${attempts} attempts`);
    return {
      confirmed: false,
      error: 'Max retries exceeded',
      attempts: attempts
    };
  }

  /**
   * Get wallet transactions from blockchain
   */
  async getWalletTransactions(address) {
    try {
      const response = await axios.get(`${this.apiBase}/getTransactions`, {
        params: {
          address: address,
          limit: 10,
          archival: false
        }
      });

      if (response.data.ok && response.data.result) {
        return response.data.result.map(tx => ({
          hash: tx.transaction_id.hash,
          timestamp: tx.utime,
          amount: Math.abs(tx.in_msg?.value || 0),
          source: tx.in_msg?.source,
          destination: tx.out_msgs?.[0]?.destination
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Check if transaction exists on blockchain
   */
  async checkTransaction(txHash) {
    try {
      const response = await axios.get(`${this.apiBase}/getTransactionData`, {
        params: {
          tx_hash: txHash
        }
      });

      return response.data.ok;
    } catch (error) {
      console.error('Error checking transaction:', error);
      return false;
    }
  }

  /**
   * Get contract balance
   */
  async getContractBalance(contractAddress) {
    try {
      const response = await axios.get(`${this.apiBase}/getAddressBalance`, {
        params: {
          address: contractAddress
        }
      });

      if (response.data.ok) {
        return response.data.result;
      }

      return null;
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }
}

module.exports = TransactionVerifier;
