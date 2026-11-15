const auditLogs = [];

const shield = {
  getAuditLogs() {
    return auditLogs;
  },

  evaluateRequest({ model, prompt, currentSpendUsd }) {
    const result = {
      allowed: true,
      model,
      promptLength: prompt.length,
      currentSpendUsd,
      checkedAt: new Date().toISOString()
    };

    auditLogs.push(result);
    return result;
  }
};

module.exports = {
  getShield() {
    return shield;
  }
};