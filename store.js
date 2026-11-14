/**
 * SKILLORA Reactive Frontend Data Store
 * Provides unified state management across all dashboard modules.
 */

const Store = {
  profile: null,
  claimProofEval: null,
  opportunities: [],
  activeRoadmap: null,
  applications: [],

  async init() {
    await Promise.all([
      this.fetchProfile(),
      this.fetchClaimProof(),
      this.fetchOpportunities()
    ]);
  },

  async fetchProfile() {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        this.profile = data.profile;
        this.activeRoadmap = data.profile.activeRoadmap;
        this.applications = data.profile.applications || [];
        return this.profile;
      }
    } catch (e) {
      console.warn('Using local fallback profile state:', e.message);
    }
  },

  async fetchClaimProof() {
    try {
      const res = await fetch('/api/claim-proof/evaluate');
      if (res.ok) {
        const data = await res.json();
        this.claimProofEval = data.evaluation;
        return this.claimProofEval;
      }
    } catch (e) {
      console.warn('Using local fallback claim-proof state:', e.message);
    }
  },

  async fetchOpportunities(query = {}) {
    try {
      const params = new URLSearchParams(query);
      const res = await fetch(`/api/opportunities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        this.opportunities = data.opportunities || [];
        return this.opportunities;
      }
    } catch (e) {
      console.warn('Failed to fetch opportunities:', e.message);
    }
  },

  async matchOpportunity(oppId) {
    try {
      const res = await fetch(`/api/opportunities/${oppId}/match`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.matchReport;
      }
    } catch (e) {
      console.error('Error matching opportunity:', e);
    }
  },

  async toggleTask(taskId) {
    try {
      const res = await fetch(`/api/roadmaps/tasks/${taskId}/toggle`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        await this.fetchProfile();
        return data;
      }
    } catch (e) {
      console.error('Error toggling task:', e);
    }
  },

  async addApplication({ company, role, status, notes }) {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, status, notes })
      });
      if (res.ok) {
        await this.fetchProfile();
        return true;
      }
    } catch (e) {
      console.error('Error adding application:', e);
    }
    return false;
  }
};
