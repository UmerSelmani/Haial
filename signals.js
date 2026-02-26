/* ═══════════════════════════════════════
   HAIAL — Signals Page (MTFCM)
   ═══════════════════════════════════════ */

function renderSignalsPage(t) {
  const features = [
    { icon: '📈', title: t.sf1, desc: t.sf1d },
    { icon: '🕌', title: t.sf2, desc: t.sf2d },
    { icon: '🎯', title: t.sf3, desc: t.sf3d },
    { icon: '⚡', title: t.sf4, desc: t.sf4d },
  ];

  const halalCoins = COINS.filter(c => c.category === 'Halal');

  return `
    <div class="page-container">
      <div class="card animate-fade-up" style="padding:24px">
        <div class="text-center mb-20">
          <h1 class="section-title">📊 ${t.signalsTitle}</h1>
          <p class="section-subtitle">${t.signalsDesc}</p>
        </div>

        <div class="grid-features mb-16">
          ${features.map((f, i) => `
            <div class="card-accent glow-card animate-fade-up stagger-${i+1}">
              <div class="feature-emoji">${f.icon}</div>
              <h3 class="feature-title">${f.title}</h3>
              <p class="feature-desc">${f.desc}</p>
            </div>
          `).join('')}
        </div>

        <div class="halal-pairs-box">
          <h3 style="font-weight:700;font-size:13px;margin-bottom:10px;color:var(--text-accent-dark)">${t.halalPairs}</h3>
          <div class="grid-pairs">
            ${halalCoins.map(c => `
              <div class="halal-pair">${Icons.check(12)} ${c.ticker}/USDT</div>
            `).join('')}
          </div>
        </div>

        <div class="warn-box">
          <div class="coming-icon">${Icons.zap(28)}</div>
          <p class="warn-title">${t.signalsComingSoon}</p>
          <p class="warn-sub">${t.signalsNote}</p>
        </div>
      </div>
    </div>`;
}
