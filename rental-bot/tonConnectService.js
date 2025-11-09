const axios = require('axios');
const { Address, beginCell, toNano } = require('@ton/core');

class TONConnectService {
  constructor(contractAddress, network = 'testnet') {
    this.contractAddress = contractAddress;
    this.network = network;
    this.apiBase = network === 'testnet' 
      ? 'https://testnet.toncenter.com/api/v2'
      : 'https://toncenter.com/api/v2';
  }

  /**
   * Create rent item transaction
   */
  createRentTransaction(itemId, ownerAddress, price, deposit, duration) {
    try {
      const ownerAddr = Address.parse(ownerAddress);
      
      const body = beginCell()
        .storeUint(0x1, 32)           // Operation: rentItem
        .storeUint(itemId, 64)        // Item ID
        .storeAddress(ownerAddr)      // Owner address
        .storeCoins(toNano(price))    // Price
        .storeCoins(toNano(deposit))  // Deposit
        .storeUint(duration, 32)      // Duration
        .endCell();

      return {
        address: this.contractAddress,
        amount: toNano(price + deposit + 0.1).toString(), // Price + deposit + gas
        payload: body.toBoc().toString('base64')
      };
    } catch (error) {
      throw new Error(`Failed to create rent transaction: ${error.message}`);
    }
  }

  /**
   * Create return item transaction
   */
  createReturnTransaction(itemId) {
    const body = beginCell()
      .storeUint(0x2, 32)           // Operation: returnItem
      .storeUint(itemId, 64)        // Item ID
      .endCell();

    return {
      address: this.contractAddress,
      amount: toNano(0.05).toString(), // Gas fee
      payload: body.toBoc().toString('base64')
    };
  }

  /**
   * Create dispute transaction
   */
  createDisputeTransaction(itemId, reason) {
    const body = beginCell()
      .storeUint(0x3, 32)           // Operation: reportDispute
      .storeUint(itemId, 64)        // Item ID
      .storeUint(reason.length, 32) // Reason length
      .storeBuffer(Buffer.from(reason))
      .endCell();

    return {
      address: this.contractAddress,
      amount: toNano(0.05).toString(),
      payload: body.toBoc().toString('base64')
    };
  }

  /**
   * Get rental details
   */
  async getRentalDetails(itemId) {
    try {
      const response = await axios.get(
        `${this.apiBase}/runGetMethod`,
        {
          params: {
            address: this.contractAddress,
            method: 'getRentalDetails',
            stack: [[{ 'type': 'num', 'number': itemId }]]
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting rental details:', error);
      return null;
    }
  }
}

module.exports = TONConnectService;