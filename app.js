/**
 * SKILLORA Core Application Orchestrator
 * High-craft routing, state synchronization, and interactive workflows.
 */

const App = {
  currentView: 'view-dashboard',

  async init() {
    this.setupNavigation();
    this.setupModals();
    await Store.init();

    // Render Submodules
    this.renderDashboard();
    this.renderProfile();
    this.renderKanban();
    this.renderRoadmaps();

    if (window.ClaimProofUI) ClaimProofUI.render();
    if (window.OpportunityUI) OpportunityUI.renderOpportunities();
    if (window.ResumeUI) {
      ResumeUI.init();
      ResumeUI.evaluate();
      ResumeUI.renderLinkedIn();
      ResumeUI.renderGitHub();
    }
    if (window.AgentUI) AgentUI.init();
    if (window.PruneUI) PruneUI.init();

    // Setup action buttons
    const quickSwarmBtn = document.getElementById('btn-quick-run-swarm');
    if (quickSwarmBtn) {
      quickSwarmBtn.addEventListener('click', () => this.runQuickSwarm());
    }

    const reEvalBtn = document.getElementById('btn-re-evaluate-claim-proof');
    if (reEvalBtn) {
      reEvalBtn.addEventListener('click', async () => {
        await Store.fetchClaimProof();
        ClaimProofUI.render();
      });
    }

    const matchBtn = document.getElementById('btn-evaluate-readiness');
    if (matchBtn) {
      matchBtn.addEventListener('click', () => {
        const sel = document.getElementById('readiness-select-opp');
        if (sel && sel.value) OpportunityUI.matchAndShow(sel.value);
      });
    }

    // Filter Buttons in Claim Proof
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filterVal = e.target.getAttribute('data-filter');
        ClaimProofUI.currentFilter = filterVal;
        ClaimProofUI.renderTableRows();
      });
    });

    const cpSearch = document.getElementById('claim-proof-search');
    if (cpSearch) {
      cpSearch.addEventListener('input', (e) => {
        ClaimProofUI.searchQuery = e.target.value;
        ClaimProofUI.renderTableRows();
      });
    }

    // Opportunity filters
    const filterBtn = document.getElementById('btn-filter-opps');
    if (filterBtn) {
      filterBtn.addEventListener('click', async () => {
        const q = document.getElementById('opp-search-query').value;
        const cat = document.getElementById('opp-filter-category').value;
        const type = document.getElementById('opp-filter-type').value;
        await Store.fetchOpportunities({ q, category: cat, type });
        OpportunityUI.renderOpportunities();
      });
    }
  },

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetView = item.getAttribute('data-view');
        this.navigateTo(targetView);
      });
    });
  },

  navigateTo(viewId) {
    document.querySelectorAll('.nav-item').forEach(i => {
      i.classList.toggle('active', i.getAttribute('data-view') === viewId);
    });

    document.querySelectorAll('.module-view').forEach(view => {
      view.classList.toggle('active', view.id === viewId);
    });

    this.currentView = viewId;

    // Update Header Breadcrumb
    const crumb = document.getElementById('header-active-crumb');
    if (crumb) {
      const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
      crumb.textContent = activeNav ? activeNav.textContent.trim() : 'Dashboard';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setupModals() {
    const addAppBtn = document.getElementById('btn-add-application-modal');
    if (addAppBtn) {
      addAppBtn.addEventListener('click', () => {
        document.getElementById('modal-add-app').classList.add('active');
      });
    }

    const submitAppBtn = document.getElementById('btn-submit-new-app');
    if (submitAppBtn) {
      submitAppBtn.addEventListener('click', async () => {
        const company = document.getElementById('modal-app-company').value.trim();
        const role = document.getElementById('modal-app-role').value.trim();
        const status = document.getElementById('modal-app-status').value;
        const notes = document.getElementById('modal-app-notes').value.trim();

        if (!company || !role) {
          alert('Please specify both company and role.');
          return;
        }

        await Store.addApplication({ company, role, status, notes });
        this.closeModals();
        this.renderKanban();
      });
    }
  },

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  },

  renderDashboard() {
    const p = Store.profile;
    if (!p) return;

    // Active Sprint Tasks
    const sprintContainer = document.getElementById('dash-tasks-preview');
    if (sprintContainer && p.activeRoadmap) {
      const allTasks = [];
      p.activeRoadmap.milestones.forEach(m => allTasks.push(...m.tasks));

      sprintContainer.innerHTML = allTasks.slice(0, 3).map(t => `
        <div style="background: var(--bg-surface-elevated); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="App.toggleTask('${t.id}')">
            <span style="color: ${t.completed ? 'var(--text-muted)' : '#ffffff'}; text-decoration: ${t.completed ? 'line-through' : 'none'};">${t.title}</span>
          </div>
          <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--brand-primary);">${t.points} pts</span>
        </div>
      `).join('');
    }
  },

  renderProfile() {
    const p = Store.profile;
    if (!p || !p.user) return;

    const u = p.user;
    const nameEl = document.getElementById('sidebar-user-name');
    if (nameEl) nameEl.textContent = u.name;

    const colEl = document.getElementById('sidebar-user-college');
    if (colEl) colEl.textContent = `${u.college.split('(')[0].trim()} • CGPA ${u.cgpa}`;

    const connGrid = document.getElementById('prof-connections-grid');
    if (connGrid && u.connectedAccounts) {
      const ca = u.connectedAccounts;
      connGrid.innerHTML = `
        <div class="stat-card">
          <div class="stat-label">GitHub Integration</div>
          <div style="font-weight: 600; color: #ffffff;">${ca.github.username}</div>
          <div class="stat-caption" style="color: var(--color-success);">✓ Connected (${ca.github.reposCount} repos)</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">LinkedIn Profile</div>
          <div style="font-weight: 600; color: #ffffff;">${ca.linkedin.username}</div>
          <div class="stat-caption" style="color: var(--color-success);">✓ Synced (${ca.linkedin.profileStrength})</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Coding Platforms</div>
          <div style="font-weight: 600; color: #ffffff;">LeetCode (${ca.leetcode.rating})</div>
          <div class="stat-caption" style="color: var(--color-success);">✓ ${ca.leetcode.solved} Solved</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Resume Document</div>
          <div style="font-weight: 600; color: #ffffff;">PDF Uploaded</div>
          <div class="stat-caption" style="color: var(--brand-primary);">ATS Score 88/100</div>
        </div>
      `;
    }
  },

  renderKanban() {
    const container = document.getElementById('kanban-board-container');
    if (!container) return;

    const apps = Store.applications || [];
    const stages = ['Interested', 'Preparing', 'Applied', 'Interview', 'Selected'];

    container.innerHTML = stages.map(stage => {
      const stageApps = apps.filter(a => a.status === stage);
      return `
        <div class="kanban-col">
          <div class="kanban-col-header">
            <span>${stage}</span>
            <span class="kanban-col-count">${stageApps.length}</span>
          </div>
          <div class="kanban-cards-list">
            ${stageApps.length === 0 ? `
              <div style="color: var(--text-muted); font-size: 0.75rem; text-align: center; padding: 1.5rem 0;">Empty</div>
            ` : stageApps.map(app => `
              <div class="kanban-card">
                <div style="font-weight: 600; font-size: 0.85rem; color: #ffffff;">${app.company}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.4rem;">${app.role}</div>
                ${app.nextAction ? `
                  <div style="font-size: 0.7rem; color: var(--brand-primary); background: rgba(56, 189, 248, 0.08); padding: 0.3rem 0.4rem; border-radius: 4px; margin-bottom: 0.4rem;">
                    ➔ ${app.nextAction}
                  </div>
                ` : ''}
                <div style="font-size: 0.68rem; color: var(--text-muted);">${app.notes || 'No notes added'}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    const badgeActive = document.getElementById('badge-active-apps');
    if (badgeActive) badgeActive.textContent = apps.length;
  },

  renderRoadmaps() {
    const container = document.getElementById('roadmap-view-content');
    if (!container || !Store.activeRoadmap) return;

    const r = Store.activeRoadmap;
    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.4rem;">
          <span>Target Progress</span>
          <strong style="color: var(--color-success);">${r.progressPct}% Completed</strong>
        </div>
        <div class="progress-bar-bg" style="height: 8px;">
          <div class="progress-bar-fill" style="width: ${r.progressPct}%; background: var(--color-success);"></div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${r.milestones.map(ms => `
          <div class="card" style="padding: 1.25rem; background: var(--bg-surface-elevated);">
            <div style="font-weight: 600; font-size: 0.95rem; color: var(--brand-primary); margin-bottom: 0.3rem;">
              ${ms.phase}
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.8rem;">
              ${ms.objective}
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${ms.tasks.map(t => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.82rem;">
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="App.toggleTask('${t.id}')">
                    <span style="color: ${t.completed ? 'var(--text-muted)' : '#ffffff'}; text-decoration: ${t.completed ? 'line-through' : 'none'};">${t.title}</span>
                  </div>
                  <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--brand-primary);">${t.points} pts</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  async toggleTask(taskId) {
    const res = await Store.toggleTask(taskId);
    if (res && res.success) {
      this.renderRoadmaps();
      this.renderDashboard();
    }
  },

  async runQuickSwarm() {
    const btn = document.getElementById('btn-quick-run-swarm');
    if (btn) btn.innerHTML = `<span>⏳</span> Swarm Running...`;

    try {
      await fetch('/api/intelligence/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: 'Alex Mercer',
          targetRoleId: 'full-stack-ai-engineer'
        })
      });

      await Store.fetchClaimProof();
      ClaimProofUI.render();
      if (window.PruneUI) PruneUI.fetchStats();
      if (window.AgentUI) AgentUI.fetchLiveStatus();

      alert('Maritime AI Swarm completed full analysis. Claim vs Proof & Readiness reports updated!');
    } catch (e) {
      alert(`Swarm execution: ${e.message}`);
    } finally {
      if (btn) btn.innerHTML = `⚡ Run Swarm`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
