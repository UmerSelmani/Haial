/* ═══════════════════════════════════════
   HAIAL — Learn Page
   ═══════════════════════════════════════ */

function renderLearnPage(t) {
  const pillars = [
    { icon: '🎯', title: t.pillar1, desc: t.pillar1Desc },
    { icon: '🏗️', title: t.pillar2, desc: t.pillar2Desc },
    { icon: '📊', title: t.pillar3, desc: t.pillar3Desc },
    { icon: '⚖️', title: t.pillar4, desc: t.pillar4Desc },
  ];

  const terms = [
    { title: t.riba, desc: t.ribaDesc },
    { title: t.gharar, desc: t.ghararDesc },
    { title: t.maisir, desc: t.maisirDesc },
    { title: t.utilityToken, desc: t.utilityTokenDesc },
  ];

  return `
    <div class="page-container">
      <div class="card animate-fade-up" style="padding:24px">
        <h1 class="section-title mb-20">📖 ${t.learnTitle}</h1>

        <h2 class="section-heading">${t.introToIslamic}</h2>
        <p class="section-text mb-20">${t.introDesc}</p>

        <h2 class="section-heading">${t.fourPillar}</h2>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px">${t.fourPillarDesc}</p>
        <div class="grid-features mb-20">
          ${pillars.map((p, i) => `
            <div class="card-accent glow-card animate-fade-up stagger-${i+1}">
              <div class="feature-emoji">${p.icon}</div>
              <h3 class="feature-title">${p.title}</h3>
              <p class="feature-desc">${p.desc}</p>
            </div>
          `).join('')}
        </div>

        <h2 class="section-heading mb-12">${t.keyTerms}</h2>
        ${terms.map(item => `
          <div class="card-inner glow-card" style="margin-bottom:8px">
            <h4 style="font-weight:600;font-size:13px;color:var(--text-primary)">${item.title}</h4>
            <p style="font-size:12px;margin-top:4px;color:var(--text-muted)">${item.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>`;
}
