/**
 * SKILLORA Claim vs Proof UI Module
 * Renders the signature verification matrix, transparent categories,
 * and proof artifact drill-downs.
 */

const ClaimProofUI = {
  currentFilter: 'All',
  searchQuery: '',

  render() {
    const evalData = Store.claimProofEval;
    if (!evalData) return;

    // Update counts
    const b = evalData.breakdown || {};
    const countAll = document.getElementById('cp-count-all');
    if (countAll) countAll.textContent = evalData.totalClaimed;
    const countStrong = document.getElementById('cp-count-strong');
    if (countStrong) countStrong.textContent = b.strongEvidence;
    const countPartial = document.getElementById('cp-count-partial');
    if (countPartial) countPartial.textContent = b.partialEvidence;
    const countNone = document.getElementById('cp-count-none');
    if (countNone) countNone.textContent = b.noEvidence;

    // Dashboard quick snapshot counts
    const dashStrong = document.getElementById('dash-strong-count');
    if (dashStrong) dashStrong.textContent = `${b.strongEvidence} Skills`;
    const dashPartial = document.getElementById('dash-partial-count');
    if (dashPartial) dashPartial.textContent = `${b.partialEvidence} Skills`;
    const dashLimited = document.getElementById('dash-limited-count');
    if (dashLimited) dashLimited.textContent = `${b.limitedEvidence} Skills`;
    const dashNone = document.getElementById('dash-none-count');
    if (dashNone) dashNone.textContent = `${b.noEvidence} Skills`;

    const dashRate = document.getElementById('dash-verified-rate-val');
    if (dashRate) dashRate.textContent = `${evalData.verificationRatePct}%`;

    this.renderTableRows();
  },

  renderTableRows() {
    const tbody = document.getElementById('claim-proof-table-body');
    if (!tbody || !Store.claimProofEval) return;

    let skills = Store.claimProofEval.skills || [];

    // Filter
    if (this.currentFilter !== 'All') {
      skills = skills.filter(s => s.evidenceCategory === this.currentFilter);
    }

    // Search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      skills = skills.filter(s => s.skillName.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }

    if (skills.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No matching skills found.</td></tr>`;
      return;
    }

    tbody.innerHTML = skills.map(skill => {
      let badgeClass = 'badge-none';
      if (skill.evidenceCategory === 'Strong Evidence') badgeClass = 'badge-strong';
      else if (skill.evidenceCategory === 'Partial Evidence') badgeClass = 'badge-partial';
      else if (skill.evidenceCategory === 'Limited Evidence') badgeClass = 'badge-limited';

      return `
        <tr>
          <td><strong style="color: #ffffff;">${skill.skillName}</strong></td>
          <td style="color: var(--text-secondary);">${skill.category}</td>
          <td><span style="font-family: var(--font-mono); font-size: 0.78rem;">${skill.claimedProficiency} (${skill.claimedYears}y)</span></td>
          <td><span class="badge ${badgeClass}">${skill.evidenceCategory}</span></td>
          <td><span style="font-family: var(--font-mono); font-weight: 600; color: ${skill.confidenceScore >= 80 ? 'var(--color-success)' : skill.confidenceScore >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'};">${skill.confidenceScore}%</span></td>
          <td style="max-width: 320px; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">
            ${skill.basisOfAssessment}
          </td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="ClaimProofUI.inspectSkill('${skill.skillName}')">
              Inspect
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  inspectSkill(skillName) {
    const skill = (Store.claimProofEval.skills || []).find(s => s.skillName === skillName);
    if (!skill) return;

    const modal = document.getElementById('modal-readiness-drilldown');
    const title = document.getElementById('modal-drilldown-title');
    const comp = document.getElementById('modal-drilldown-company');
    const body = document.getElementById('modal-drilldown-body');

    title.textContent = `Claim vs Proof Audit: ${skill.skillName}`;
    comp.textContent = `${skill.category} • Claimed ${skill.claimedProficiency}`;

    let artifactsHtml = '<p style="color: var(--text-muted); font-size: 0.8rem;">No public code repositories or credentials located for this claim.</p>';
    if (skill.artifacts && skill.artifacts.length > 0) {
      artifactsHtml = skill.artifacts.map(a => `
        <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 0.5rem; border-left: 3px solid var(--color-success);">
          <div style="font-weight: 600; color: #ffffff; font-size: 0.85rem;">${a.title}</div>
          <div style="font-size: 0.75rem; color: var(--brand-primary); font-family: var(--font-mono);">${a.metrics}</div>
          ${a.url ? `<a href="${a.url}" target="_blank" style="color: var(--text-muted); font-size: 0.72rem; text-decoration: underline;">View Public Repository ↗</a>` : ''}
        </div>
      `).join('');
    }

    body.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <div class="sidebar-heading" style="padding-left: 0;">Evidence Status & Confidence</div>
        <div style="display: flex; gap: 0.75rem; align-items: center; margin-top: 0.3rem;">
          <span class="badge ${skill.evidenceCategory === 'Strong Evidence' ? 'badge-strong' : skill.evidenceCategory === 'Partial Evidence' ? 'badge-partial' : 'badge-none'}">${skill.evidenceCategory}</span>
          <span style="font-family: var(--font-mono); font-size: 0.88rem; font-weight: 700; color: #ffffff;">${skill.confidenceScore}% Verified</span>
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <div class="sidebar-heading" style="padding-left: 0;">Supporting Artifacts</div>
        ${artifactsHtml}
      </div>

      <div style="margin-bottom: 1.25rem;">
        <div class="sidebar-heading" style="padding-left: 0;">Actionable Recommendation</div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-sm); border-left: 3px solid var(--brand-primary);">
          ${skill.recommendation}
        </p>
      </div>

      <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="App.closeModals()">Close Inspector</button>
    `;

    modal.classList.add('active');
  }
};
