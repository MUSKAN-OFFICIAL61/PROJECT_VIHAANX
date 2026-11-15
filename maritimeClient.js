/**
 * Maritime Agent Infrastructure Client (maritime.sh)
 * 
 * Manages the deployment, provisioning, sleep/wake states,
 * and isolated microVM lifecycle for SKILLORA's 7 specialized AI agents:
 * 1. Resume Intelligence Agent (NLP extraction & STAR scoring)
 * 2. Profile Analysis Agent (Professional identity & LinkedIn evaluation)
 * 3. GitHub Intelligence Agent (Repository audit & code depth)
 * 4. Skill Evidence Agent (Claim vs Proof validation)
 * 5. Opportunity Analysis Agent (Job requirement & eligibility extraction)
 * 6. Career Matching Agent (Eligibility vs Skill-based fit scoring)
 * 7. Roadmap Generation Agent (Personalized 30-60-90 sprint builder)
 */

const env = require('../../config/env');
const https = require('https');
const http = require('http');
const url = require('url');

class MaritimeClient {
  constructor() {
    this.apiKey = env.maritime.apiKey;
    this.baseUrl = env.maritime.baseUrl;
    this.mode = env.maritime.mode; // 'production' or 'sandbox'

    // Local registry tracking agent states, microVM metadata, and lifecycle
    this.agentRegistry = new Map();
    this.lifecycleLogs = [];

    // Initialize the 7 specialized SKILLORA agents
    this._initializeDefaultAgents();
  }

  _initializeDefaultAgents() {
    const agents = [
      {
        id: 'agent_resume_01',
        externalId: 'skillora-resume-agent',
        name: 'Resume Intelligence Agent',
        template: 'openclaw-nlp-extractor',
        role: 'Extracts skills, achievements, ATS compliance, and STAR statements from resumes',
        status: 'SLEEPING',
        microVmId: 'mvm_res_948a',
        memoryMb: 512,
        cpuCores: 1
      },
      {
        id: 'agent_profile_02',
        externalId: 'skillora-profile-agent',
        name: 'Profile Analysis Agent',
        template: 'openclaw-profile-evaluator',
        role: 'Evaluates unified professional identity, career velocity, and LinkedIn positioning',
        status: 'SLEEPING',
        microVmId: 'mvm_prof_117b',
        memoryMb: 512,
        cpuCores: 1
      },
      {
        id: 'agent_github_03',
        externalId: 'skillora-github-agent',
        name: 'GitHub Intelligence Agent',
        template: 'openclaw-code-inspector',
        role: 'Audits public repositories, README clarity, commits, test suites, and architecture',
        status: 'SLEEPING',
        microVmId: 'mvm_git_832c',
        memoryMb: 512,
        cpuCores: 1
      },
      {
        id: 'agent_skill_evidence_04',
        externalId: 'skillora-evidence-agent',
        name: 'Skill Evidence Agent',
        template: 'hermes-evidence-verifier',
        role: 'Calculates Claim vs Proof confidence across Strong, Partial, Limited, and No-Evidence categories',
        status: 'SLEEPING',
        microVmId: 'mvm_evid_552d',
        memoryMb: 512,
        cpuCores: 1
      },
      {
        id: 'agent_opp_analysis_05',
        externalId: 'skillora-opportunity-agent',
        name: 'Opportunity Analysis Agent',
        template: 'hermes-opp-extractor',
        role: 'Parses complex job requisitions into formal eligibility cut-offs and required skill tiers',
        status: 'SLEEPING',
        microVmId: 'mvm_opp_319e',
        memoryMb: 512,
        cpuCores: 1
      },
      {
        id: 'agent_career_matching_06',
        externalId: 'skillora-matching-agent',
        name: 'Career Matching Agent',
        template: 'hermes-readiness-matcher',
        role: 'Disentangles formal eligibility (CGPA/branch) from skill readiness to compute Career Fit',
        status: 'SLEEPING',
        microVmId: 'mvm_match_680f',
        memoryMb: 512,
        cpuCores: 1
      },
      {
        id: 'agent_roadmap_07',
        externalId: 'skillora-roadmap-agent',
        name: 'Roadmap Generation Agent',
        template: 'hermes-roadmap-synthesizer',
        role: 'Synthesizes detected skill gaps into actionable, milestone-driven preparation sprints',
        status: 'SLEEPING',
        microVmId: 'mvm_road_774g',
        memoryMb: 512,
        cpuCores: 1
      }
    ];

    for (const a of agents) {
      this.agentRegistry.set(a.id, {
        ...a,
        uptimeSeconds: 0,
        lastWokenAt: null,
        lastSleptAt: new Date().toISOString(),
        totalTasksExecuted: 0
      });
    }
  }

  /**
   * Provisions or retrieves an isolated agent instance in Maritime
   */
  async provision({ externalId, name, template }) {
    this._logLifecycle(externalId, 'PROVISION_REQUESTED', `Provisioning isolated microVM container for ${name}`);

    // If in production mode with a live Maritime key, send request to Maritime
    if (this.mode === 'production' && this.apiKey && this.apiKey.startsWith('mrt_live_')) {
      try {
        const res = await this._callMaritimeApi('/agents/provision', 'POST', {
          externalId,
          name,
          template
        });
        if (res && res.agent) {
          this.agentRegistry.set(res.agent.id, res.agent);
          return res.agent;
        }
      } catch (err) {
        console.warn(`[Maritime] Provision API call fallback: ${err.message}`);
      }
    }

    // Sandbox / Idempotent resolution
    for (const [id, agent] of this.agentRegistry.entries()) {
      if (agent.externalId === externalId) {
        agent.status = 'READY';
        this._logLifecycle(id, 'AGENT_READY', `Agent ${name} is ready on microVM ${agent.microVmId}`);
        return agent;
      }
    }

    const newAgent = {
      id: `agent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      externalId,
      name,
      template,
      status: 'READY',
      microVmId: `mvm_${Math.random().toString(36).substring(2, 9)}`,
      memoryMb: 512,
      cpuCores: 1,
      totalTasksExecuted: 0,
      lastWokenAt: new Date().toISOString()
    };

    this.agentRegistry.set(newAgent.id, newAgent);
    this._logLifecycle(newAgent.id, 'PROVISION_COMPLETE', `New agent ${name} provisioned successfully`);
    return newAgent;
  }

  /**
   * Wakes an agent, executes a message/task, then transitions back to sleep to save compute
   */
  async chat(agentId, message, executorFn) {
    const agent = this.agentRegistry.get(agentId);
    if (!agent) {
      throw new Error(`Maritime Agent '${agentId}' not found in registry`);
    }

    // 1. Wake Agent (Maritime sleep/wake architecture)
    agent.status = 'AWAKE';
    agent.lastWokenAt = new Date().toISOString();
    this._logLifecycle(agentId, 'AGENT_WAKE', `Agent ${agent.name} woke up from standby (${agent.microVmId})`);

    // 2. Set Status to PROCESSING
    agent.status = 'PROCESSING';

    let result;
    try {
      if (this.mode === 'production' && this.apiKey && this.apiKey.startsWith('mrt_live_')) {
        const liveRes = await this._callMaritimeApi(`/agents/${agentId}/chat`, 'POST', { message });
        result = liveRes.response;
      } else {
        // Execute through provided executor function (which routes through Prune Gateway)
        result = await executorFn(message);
      }

      agent.totalTasksExecuted += 1;
      this._logLifecycle(agentId, 'TASK_COMPLETED', `Task successfully executed by ${agent.name}`);
    } catch (err) {
      this._logLifecycle(agentId, 'TASK_FAILED', `Error executing task on ${agent.name}: ${err.message}`);
      throw err;
    } finally {
      // 3. Automatically put agent to sleep to optimize compute costs
      agent.status = 'SLEEPING';
      agent.lastSleptAt = new Date().toISOString();
      this._logLifecycle(agentId, 'AGENT_SLEEP', `Agent ${agent.name} returned to sleep standby`);
    }

    return {
      agentId,
      agentName: agent.name,
      response: result
    };
  }

  _logLifecycle(agentId, event, details) {
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      agentId,
      event,
      details
    };
    this.lifecycleLogs.unshift(entry);
    if (this.lifecycleLogs.length > 200) {
      this.lifecycleLogs.pop();
    }
  }

  getAgents() {
    return Array.from(this.agentRegistry.values());
  }

  getAgent(agentId) {
    return this.agentRegistry.get(agentId);
  }

  getLogs() {
    return this.lifecycleLogs;
  }

  _callMaritimeApi(endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const fullUrl = `${this.baseUrl}${endpoint}`;
      const parsedUrl = url.parse(fullUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const payload = body ? JSON.stringify(body) : null;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client': 'Skillora-Maritime-Integration/2.0'
        },
        timeout: 8000
      };

      if (payload) {
        options.headers['Content-Length'] = Buffer.byteLength(payload);
      }

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Failed to parse Maritime API JSON: ${e.message}`));
            }
          } else {
            reject(new Error(`Maritime HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Maritime connection timed out'));
      });

      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }
}

module.exports = new MaritimeClient();
