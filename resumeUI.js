/**
 * SKILLORA Evaluators UI (Resume, LinkedIn, GitHub)
 */

const ResumeUI = {
  sampleResume: `ALEX MERCER
Full Stack & AI Systems Developer | alex.mercer@gmail.com | (555) 234-5678
GitHub: github.com/alex-mercer | LinkedIn: linkedin.com/in/alex-mercer

PROFESSIONAL EXPERIENCE:
Nexus Innovations – Full Stack Engineering Intern (June 2024 – Present)
- Architected asynchronous REST APIs in Python (FastAPI) and TypeScript, reducing query latency by 42%.
- Integrated Redis query caching and multi-tenant PostgreSQL database schemas.
- Developed real-time telemetry dashboard in React 18, Next.js App Router, and Tailwind CSS.
- Technologies: Python, TypeScript, React, Next.js, FastAPI, Docker, Kubernetes, PostgreSQL, Git.

TECHNICAL PROJECTS:
Neural-RAG Pipeline (Autonomous Research Agent)
- Developed end-to-end vector search retrieval using Pinecone and LangChain.
- Wrote full unit test suite with Pytest achieving 88% statement coverage.
- Packaged multi-stage Docker containers with automated GitHub Actions CI/CD.

EDUCATION:
B.Tech in Computer Science, IIT BHU (Graduation: May 2025) • CGPA: 8.72/10.0`,

  init() {
    const input = document.getElementById('resume-text-input');
    if (input && !input.value) {
      input.value = this.sampleResume;
    }
  },

  async evaluate() {
    const input = document.getElementById('resume-text-input');
    const text = input ? input.value : this.sampleResume;

    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text, targetRole: 'Full Stack AI Engineer' })
      });
      const data = await res.json();
      this.renderResults(data.analysis);
    } catch (e) {
      console.error('Resume eval error:', e);
    }
  },

  renderResults(analysis) {
    if (!analysis) return;

    const scoreEl = document.getElementById('resume-ats-score');
    if (scoreEl) scoreEl.textContent = `${analysis.atsScore}/100`;

    const summaryEl = document.getElementById('resume-ats-summary');
    if (summaryEl) summaryEl.textContent = analysis.overallAssessment;

    const sectionsEl = document.getElementById('resume-sections-container');
    if (sectionsEl) {
      sectionsEl.innerHTML = analysis.sectionEvaluations.map(s => `
        <div style="background: var(--bg-surface); padding: 0.6rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 0.4rem; font-size: 0.78rem; display: flex; justify-content: space-between;">
          <div>
            <strong style="color: #ffffff;">${s.section}</strong>: <span style="color: var(--text-secondary);">${s.feedback}</span>
          </div>
          <span style="font-family: var(--font-mono); color: var(--color-success); font-weight: 600;">${s.score}/100</span>
        </div>
      `).join('');
    }

    const rewritesEl = document.getElementById('resume-rewrites-container');
    if (rewritesEl) {
      rewritesEl.innerHTML = analysis.rewritingSuggestions.map(r => `
        <div style="background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-sm); border-left: 3px solid var(--brand-primary);">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.2rem;">Framework: ${r.framework}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); text-decoration: line-through; margin-bottom: 0.3rem;">Before: "${r.original}"</div>
          <div style="font-size: 0.82rem; color: #ffffff; font-weight: 500;">After: "${r.improved}"</div>
        </div>
      `).join('');
    }
  },

  renderLinkedIn() {
    const container = document.getElementById('linkedin-intel-content');
    if (!container) return;

    container.innerHTML = `
      <div class="grid-2" style="margin-bottom: 1.5rem;">
        <div class="card" style="background: var(--bg-surface-elevated); padding: 1.25rem;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Profile Strength Score</div>
          <div class="stat-value" style="color: var(--color-success);">84/100</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.4rem;">
            All-Star rating with strong search keyword density.
          </div>
        </div>
        <div class="card" style="background: var(--bg-surface-elevated); padding: 1.25rem;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Headline Optimization</div>
          <div style="font-size: 0.78rem; color: var(--color-danger); margin-top: 0.2rem;">
            Current: "Student at IIT BHU | Full Stack & AI Enthusiast | Looking for Roles"
          </div>
          <div style="font-size: 0.82rem; color: var(--color-success); font-weight: 600; margin-top: 0.4rem;">
            Suggested: "Full Stack & AI Systems Engineer | FastAPI, TypeScript, Vector DBs | 200+ Open Source Commits"
          </div>
        </div>
      </div>

      <div class="sidebar-heading" style="padding-left: 0; margin-bottom: 0.5rem;">Suggested About Section Narrative</div>
      <div style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap; margin-bottom: 1.5rem;">
I engineer high-concurrency backend microservices and modern reactive web applications. 

Currently completing my B.Tech in CS at IIT BHU with a focus on autonomous agent architectures and distributed systems. 

Key Proof-of-Work:
• Neural-RAG: Asynchronous vector retrieval pipeline with 88% Pytest coverage.
• Enterprise Dashboard: Real-time telemetry console with strict TypeScript and Zustand.

Always interested in distributed systems challenges, AI infrastructure, and high-craft engineering teams.
      </div>
    `;
  },

  renderGitHub() {
    const container = document.getElementById('github-intel-content');
    if (!container) return;

    const projects = (Store.profile && Store.profile.projects) || [];

    container.innerHTML = `
      <div class="grid-3" style="margin-bottom: 1.5rem;">
        <div class="stat-card">
          <div class="stat-label">Public Repositories</div>
          <div class="stat-value">14</div>
          <div class="stat-caption">Active commits in last 7 days</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Code Quality Rating</div>
          <div class="stat-value" style="color: var(--color-success);">Grade A</div>
          <div class="stat-caption">Strict TypeScript & Pytest coverage</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Commit Velocity</div>
          <div class="stat-value">349</div>
          <div class="stat-caption">Verified contributions in 2024–2025</div>
        </div>
      </div>

      <div class="sidebar-heading" style="padding-left: 0; margin-bottom: 0.75rem;">Deep Repository Intelligence</div>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${projects.map(p => `
          <div class="card" style="padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${p.title}</h4>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${p.githubRepo}</div>
              </div>
              <span class="badge ${p.evidenceLevel === 'Strong Evidence' ? 'badge-strong' : 'badge-partial'}">${p.evidenceLevel}</span>
            </div>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.6rem;">${p.description}</p>
            <div style="display: flex; gap: 1rem; font-size: 0.75rem; color: var(--brand-primary); font-family: var(--font-mono); border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
              <span>Commits: ${p.commitsCount}</span>
              <span>Test Coverage: ${p.testCoveragePct}%</span>
              <span>Stars: ★ ${p.stars}</span>
              <span style="color: var(--text-secondary);">Stack: ${p.technologies.join(', ')}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
};
