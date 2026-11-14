/**
 * SKILLORA Maritime Agent UI Module
 * Renders the 7 specialized AI agents deployed on isolated microVM containers.
 */

const AgentUI = {
  defaultAgents: [
    { id: 'agent_resume_01', name: 'Resume Intelligence Agent', template: 'openclaw-nlp', role: 'NLP extraction, ATS parsing, and STAR impact metric scoring', icon: '📄', microVmId: 'mvm_res_948a', memoryMb: 512, cpuCores: 1, status: 'SLEEPING' },
    { id: 'agent_profile_02', name: 'Profile Analysis Agent', template: 'openclaw-profile', role: 'Evaluates unified professional identity & LinkedIn credibility', icon: '💼', microVmId: 'mvm_prof_117b', memoryMb: 512, cpuCores: 1, status: 'SLEEPING' },
    { id: 'agent_github_03', name: 'GitHub Intelligence Agent', template: 'openclaw-code', role: 'Audits repositories, commit velocity, tests, and architecture', icon: '🐙', microVmId: 'mvm_git_832c', memoryMb: 512, cpuCores: 1, status: 'SLEEPING' },
    { id: 'agent_skill_evidence_04', name: 'Skill Evidence Agent', template: 'hermes-evidence', role: 'Calculates Claim vs Proof confidence across transparent tiers', icon: '⚖️', microVmId: 'mvm_evid_552d', memoryMb: 512, cpuCores: 1, status: 'SLEEPING' },
    { id: 'agent_opp_analysis_05', name: 'Opportunity Analysis Agent', template: 'hermes-opp', role: 'Parses job requisitions into eligibility and required skills', icon: '🎯', microVmId: 'mvm_opp_319e', memoryMb: 512, cpuCores: 1, status: 'SLEEPING' },
    { id: 'agent_career_matching_06', name: 'Career Matching Agent', template: 'hermes-readiness', role: 'Separates institutional eligibility from technical skill fit', icon: '🧠', microVmId: 'mvm_match_680f', memoryMb: 512, cpuCores: 1, status: 'SLEEPING' },
    { id: 'agent_roadmap_07', name: 'Roadmap Generation Agent', template: 'hermes-roadmap', role: 'Synthesizes skill gaps into 30-60-90 Day proof-of-work sprints', icon: '🗺️', microVmId: 'mvm_road_774g', memoryMb: 512, cpuCores: 1, status: 'SLEEPING' }
  ],

  init() {
    this.render();
    const btn = document.getElementById('btn-refresh-maritime-agents');
    if (btn) btn.addEventListener('click', () => this.fetchLiveStatus());
  },

  async fetchLiveStatus() {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        this.renderCards(data.agents || this.defaultAgents);
      }
    } catch (e) {
      this.renderCards(this.defaultAgents);
    }
  },

  render() {
    this.renderCards(this.defaultAgents);
  },

  renderCards(agents) {
    const grid = document.getElementById('maritime-7-agents-grid');
    if (!grid) return;

    grid.innerHTML = agents.map(a => `
      <div class="card" style="padding: 1.25rem; background: var(--bg-surface-elevated);" id="card-${a.id}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.3rem;">${a.icon || '🤖'}</span>
            <div>
              <h4 style="font-size: 0.92rem; font-weight: 600; color: #ffffff;">${a.name}</h4>
              <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">${a.microVmId}</span>
            </div>
          </div>
          <span class="badge ${a.status === 'PROCESSING' ? 'badge-strong' : a.status === 'AWAKE' ? 'badge-partial' : 'badge-limited'}" id="badge-${a.id}">
            ${a.status || 'SLEEPING'}
          </span>
        </div>
        <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.8rem; line-height: 1.4;">
          ${a.role}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.6rem; font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
          <span>${a.memoryMb || 512}MB • ${a.cpuCores || 1} CPU</span>
          <button class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;" onclick="AgentUI.wakeAndPing('${a.id}')">
            ⚡ Wake & Ping
          </button>
        </div>
      </div>
    `).join('');
  },

  async wakeAndPing(agentId) {
    const badge = document.getElementById(`badge-${agentId}`);
    if (badge) {
      badge.textContent = 'PROCESSING';
      badge.className = 'badge badge-strong';
    }
    this.logDaemon(`Waking agent ${agentId} from sleep standby...`);

    try {
      const res = await fetch(`/api/agents/${agentId}/wake`, { method: 'POST' });
      const data = await res.json();
      this.logDaemon(`Agent ${agentId} responded: ${data.message || 'Operational'}`);
    } catch (e) {
      this.logDaemon(`Agent ${agentId} simulated wake response: Operational.`);
    } finally {
      setTimeout(() => {
        if (badge) {
          badge.textContent = 'SLEEPING';
          badge.className = 'badge badge-limited';
        }
        this.logDaemon(`Agent ${agentId} returned to sleep standby.`);
      }, 1500);
    }
  },

  logDaemon(msg) {
    const term = document.getElementById('maritime-daemon-terminal');
    if (!term) return;
    const div = document.createElement('div');
    div.innerHTML = `<span style="color: var(--text-muted);">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    term.prepend(div);
  }
};
