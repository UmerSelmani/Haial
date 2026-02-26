/* ═══════════════════════════════════════
   HAIAL — About Page
   ═══════════════════════════════════════ */

function renderAboutPage(t) {
  const values = [
    { emoji: '🔍', label: t.transparency },
    { emoji: '👥', label: t.userCentric },
    { emoji: '🕌', label: t.faithFocused },
    { emoji: '📊', label: t.dataDriven },
  ];

  const diffs = [
    { icon: Icons.shield(18), title: t.verifiedSourcesTitle, desc: t.verifiedSourcesDescA },
    { icon: Icons.zap(18), title: t.aiIntelligence, desc: t.aiIntelligenceDesc },
    { icon: Icons.eye(18), title: t.transparentLogic, desc: t.transparentLogicDesc },
  ];

  return `
    <div class="page-container">
      <div class="card animate-fade-up" style="padding:24px">
        <div class="text-center mb-20" style="margin-bottom:24px">
          <h1 class="page-title">Haial</h1>
          <p class="page-tagline">${t.tagline}</p>
          <p class="page-version">${t.version} — ${t.versionDesc}</p>
        </div>

        <h2 class="section-heading mb-8">${t.ourMission}</h2>
        <p class="section-text mb-20">${t.missionDesc}</p>

        <h2 class="section-heading mb-12">${t.ethos}</h2>
        <div class="grid-values mb-20">
          ${values.map((v, i) => `
            <div class="card-accent glow-card text-center" style="padding:14px">
              <div style="font-size:28px;margin-bottom:6px">${v.emoji}</div>
              <h3 style="font-weight:700;font-size:12px;color:var(--text-primary)">${v.label}</h3>
            </div>
          `).join('')}
        </div>

        <h2 class="section-heading mb-12">${t.whatMakesUsDifferent}</h2>
        <div class="grid-diff">
          ${diffs.map(f => `
            <div class="card-inner glow-card">
              <div style="margin-bottom:8px;color:var(--text-accent)">${f.icon}</div>
              <h3 class="feature-title">${f.title}</h3>
              <p class="feature-desc">${f.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
}
