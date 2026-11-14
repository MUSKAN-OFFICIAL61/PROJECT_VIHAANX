/**
 * SKILLORA Prune AI Gateway UI Module
 * Monitors LLM Proxy calls, token optimization, and signed receipts.
 */

const PruneUI = {
  init() {
    this.fetchStats();

    const testBtn = document.getElementById('btn-eval-prune-shield');
    if (testBtn) {
      testBtn.addEventListener('click', () => this.evaluateShield());
    }
  },

  async fetchStats() {
    try {
      const res = await fetch('/api/prune/stats');
      if (res.ok) {
        const data = await res.json();
        this.renderStats(data.metrics);
      }
    } catch (e) {
      console.warn('Failed to fetch Prune stats:', e.message);
    }
  },

  renderStats(metrics) {
    if (!metrics) return;

    const callsEl = document.getElementById('prune-stat-calls');
    if (callsEl) callsEl.textContent = metrics.totalRequests || 0;

    const cacheEl = document.getElementById('prune-stat-cache');
    if (cacheEl) cacheEl.textContent = `${metrics.cacheHitRatio || 0}%`;

    const cacheDetailEl = document.getElementById('prune-stat-cache-detail');
    if (cacheDetailEl) cacheDetailEl.textContent = `${metrics.cacheHits || 0} Hits / ${metrics.cacheMisses || 0} Misses`;

    const tokensEl = document.getElementById('prune-stat-tokens');
    if (tokensEl) tokensEl.textContent = (metrics.tokensSaved || 0).toLocaleString();

    const savedEl = document.getElementById('prune-stat-saved');
    if (savedEl) savedEl.textContent = `$${(metrics.netSavingsUsd || 0).toFixed(2)}`;

    const pctEl = document.getElementById('prune-stat-pct');
    if (pctEl) pctEl.textContent = `${metrics.overallSavingsPct || 0}% Savings`;

    // Also update dashboard KPI
    const dashSaved = document.getElementById('dash-cost-saved-val');
    if (dashSaved) dashSaved.textContent = `$${(metrics.netSavingsUsd || 0).toFixed(2)}`;

    // Render receipts
    this.renderReceipts(metrics.recentReceipts || []);
  },

  renderReceipts(receipts) {
    const container = document.getElementById('prune-receipts-list');
    if (!container) return;

    if (!receipts || receipts.length === 0) {
      container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; padding: 1rem 0;">No receipts generated yet. Run career intelligence or an agent ping to produce cryptographic receipts.</div>`;
      return;
    }

    container.innerHTML = receipts.map(r => `
      <div style="background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-family: var(--font-mono); font-size: 0.74rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <span style="color: var(--brand-primary); font-weight: 600;">Receipt: ${r.receipt_id}</span>
          <span style="color: ${r.cache_hit ? 'var(--color-success)' : 'var(--text-muted)'};">${r.cache_hit ? '⚡ CACHE HIT' : 'PROXIED'}</span>
        </div>
        <div style="color: var(--text-secondary); margin-bottom: 0.25rem;">
          Agent: ${r.agent_id} • Latency: ${r.latency_ms}ms • Tokens Saved: ${r.tokens ? r.tokens.tokens_saved : 0}
        </div>
        <div style="color: #6ee7b7; font-size: 0.68rem; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 0.3rem; word-break: break-all;">
          🛡️ Signature: ${r.verifiable_signature}
        </div>
      </div>
    `).join('');
  },

  async evaluateShield() {
    const input = document.getElementById('prune-shield-input');
    const output = document.getElementById('prune-shield-eval-result');
    if (!input || !output) return;

    const prompt = input.value.trim();
    if (!prompt) return;

    output.style.display = 'block';
    output.innerHTML = `<span style="color: var(--text-muted);">Evaluating against Prune Shield firewall...</span>`;

    try {
      const res = await fetch('/api/prune/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      const evalRes = data.shieldEvaluation || {};

      output.innerHTML = `
        <div style="color: ${evalRes.passed ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: 700; margin-bottom: 0.3rem;">
          ${evalRes.passed ? '✓ PASSED PRUNE SHIELD FIREWALL' : '✕ BLOCKED BY PRUNE SHIELD'}
        </div>
        <div style="color: var(--text-secondary); margin-bottom: 0.3rem;">
          Risk Score: ${evalRes.riskScore} • Flags: ${evalRes.flags.length > 0 ? evalRes.flags.join(', ') : 'None'}
        </div>
        <div style="color: var(--brand-primary); margin-bottom: 0.2rem;">Sanitized Upstream Prompt:</div>
        <div style="background: rgba(0,0,0,0.5); padding: 0.4rem; border-radius: 4px; color: #ffffff;">${evalRes.maskedPrompt}</div>
      `;
    } catch (e) {
      output.innerHTML = `<span style="color: var(--color-danger);">Evaluation failed: ${e.message}</span>`;
    }
  }
};
