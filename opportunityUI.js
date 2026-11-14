/**
 * SKILLORA Opportunity Discovery & Readiness UI Module
 * Powers Opportunity Search, Filters, and Opportunity-to-Readiness Evaluation.
 */

const OpportunityUI = {
  renderOpportunities() {
    const container = document.getElementById('opportunities-list');
    const selectEl = document.getElementById('readiness-select-opp');
    const dashPreview = document.getElementById('dash-opportunities-preview');
    if (!container) return;

    const opps = Store.opportunities || [];

    // Populate Select dropdown
    if (selectEl) {
      selectEl.innerHTML = opps.map(o => `
        <option value="${o.id}">${o.company} – ${o.title} (${o.category})</option>
      `).join('');
    }

    // Populate Dashboard preview
    if (dashPreview) {
      dashPreview.innerHTML = opps.slice(0, 3).map(o => `
        <div style="background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600; color: #ffffff; font-size: 0.85rem;">${o.company} • ${o.title}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${o.category} • Min CGPA ${o.eligibility.minCgpa} • ${o.stipendOrSalary}</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="OpportunityUI.matchAndShow('${o.id}')">Evaluate</button>
        </div>
      `).join('');
    }

    if (opps.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No opportunities found matching your criteria.</div>`;
      return;
    }

    container.innerHTML = opps.map(opp => `
      <div class="card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-size: 1.8rem;">${opp.logo}</div>
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 600; color: #ffffff;">${opp.title}</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary);">${opp.company} • ${opp.type} • Deadline: <span style="color: var(--color-warning);">${opp.deadline}</span></p>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge badge-strong" style="font-family: var(--font-mono);">${opp.stipendOrSalary}</span>
            <button class="btn btn-primary btn-sm" onclick="OpportunityUI.matchAndShow('${opp.id}')">
              ⚡ Match & Readiness
            </button>
          </div>
        </div>

        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.75rem; line-height: 1.5;">
          ${opp.description}
        </p>

        <!-- Eligibility & Skills Summary Tags -->
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; font-size: 0.75rem;">
          <span style="color: var(--text-muted); margin-right: 0.3rem;">Requirements:</span>
          ${opp.requirements.coreSkills.map(s => `
            <span class="system-badge" style="padding: 0.15rem 0.45rem;">${s.name} (${s.requiredLevel})</span>
          `).join('')}
          <span class="system-badge" style="color: var(--color-warning); padding: 0.15rem 0.45rem;">Min CGPA ${opp.eligibility.minCgpa}</span>
        </div>
      </div>
    `).join('');
  },

  async matchAndShow(oppId) {
    const report = await Store.matchOpportunity(oppId);
    if (!report) return;

    const modal = document.getElementById('modal-readiness-drilldown');
    const title = document.getElementById('modal-drilldown-title');
    const comp = document.getElementById('modal-drilldown-company');
    const body = document.getElementById('modal-drilldown-body');

    title.textContent = `Readiness & Eligibility: ${report.opportunity.title}`;
    comp.textContent = `${report.opportunity.company} • ${report.opportunity.stipendOrSalary}`;

    const formal = report.formalEligibility;
    const skill = report.skillMatch;
    const gapPlan = report.gapMitigationPlan;

    body.innerHTML = `
      <!-- Section 1: Separate Formal Eligibility Cut-Offs -->
      <div style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div class="sidebar-heading" style="padding-left: 0; margin-bottom: 0;">1. Institutional Eligibility Check</div>
          <span class="badge ${formal.isEligible ? 'badge-strong' : 'badge-none'}">${formal.summary}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          ${formal.criteriaChecks.map(c => `
            <div style="background: var(--bg-surface-elevated); padding: 0.55rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem; display: flex; justify-content: space-between; border-left: 3px solid ${c.passed ? 'var(--color-success)' : 'var(--color-danger)'};">
              <div>
                <strong style="color: #ffffff;">${c.criteria}:</strong> ${c.detail}
              </div>
              <span style="font-family: var(--font-mono); color: ${c.passed ? 'var(--color-success)' : 'var(--color-danger)'};">${c.passed ? 'PASSED' : 'NOT MET'}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Section 2: Technical Skill-Based Match -->
      <div style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div class="sidebar-heading" style="padding-left: 0; margin-bottom: 0;">2. Technical Skill Match Index</div>
          <span style="font-size: 1.1rem; font-weight: 700; color: var(--brand-primary); font-family: var(--font-mono);">${skill.score}/100</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          ${skill.coreSkillsBreakdown.map(s => `
            <div style="background: var(--bg-surface-elevated); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #ffffff;">${s.name}</strong> <span style="color: var(--text-muted);">(${s.requiredLevel})</span>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">${s.proof}</div>
              </div>
              <span class="badge ${s.statusClass === 'verified' ? 'badge-strong' : s.statusClass === 'partial' ? 'badge-partial' : 'badge-none'}">${s.matchStatus}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Section 3: Opportunity-to-Readiness Gap Remediation -->
      <div style="margin-bottom: 1.25rem;">
        <div class="sidebar-heading" style="padding-left: 0; margin-bottom: 0.5rem;">3. Opportunity-to-Readiness Gap Plan</div>
        ${gapPlan.gaps.length === 0 ? `
          <div style="color: var(--color-success); font-size: 0.8rem; background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-sm);">
            ✓ Zero critical skill gaps identified! You possess strong verifiable evidence across all core requirements.
          </div>
        ` : gapPlan.gaps.map(g => `
          <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 0.5rem; border-left: 3px solid var(--color-warning);">
            <div style="font-weight: 600; color: #ffffff; font-size: 0.82rem;">${g.skill} • ${g.severity}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin: 0.2rem 0;"><strong>Why It Matters:</strong> ${g.whyItMatters}</div>
            <div style="font-size: 0.75rem; color: var(--brand-primary); margin-bottom: 0.2rem;"><strong>Recommended Project:</strong> ${g.recommendedProject}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">Reassessment Target: ${g.reassessmentTimeline}</div>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="OpportunityUI.saveToApplications('${report.opportunity.id}', '${report.opportunity.company}', '${report.opportunity.title}')">
          + Add to Application Pipeline
        </button>
        <button class="btn btn-secondary btn-sm" onclick="App.closeModals()">Close</button>
      </div>
    `;

    modal.classList.add('active');
  },

  async saveToApplications(oppId, company, role) {
    await Store.addApplication({
      opportunityId: oppId,
      company,
      role,
      status: 'Preparing',
      notes: 'Added from Opportunity-to-Readiness evaluation.'
    });
    App.closeModals();
    App.navigateTo('view-tracker');
  }
};
