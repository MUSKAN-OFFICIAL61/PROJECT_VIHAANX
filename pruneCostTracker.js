const receipts = [];

const pruneCostTracker = {
  getMetrics() {
    return {
      totalRequests: receipts.length,
      totalCost: 0,
      recentReceipts: receipts
    };
  },

  addReceipt(receipt) {
    receipts.push(receipt);
  }
};

module.exports = pruneCostTracker;