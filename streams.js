/* ═══════════════════════════════════════
   HAIAL — Streams Page
   ═══════════════════════════════════════ */

function renderStreamsPage(t) {
  return `
    <div class="page-container">
      <div class="card animate-fade-up" style="padding:24px">
        <h2 class="section-title">📡 ${t.verifiedSources}</h2>
        <p class="section-subtitle mb-20">${t.verifiedSourcesDesc}</p>

        <h3 class="h3-label">${t.streamsIslamic}</h3>
        ${STREAM_SOURCES.map((s, i) => `
          <div class="card-inner glow-card flex items-center justify-between stagger-${i+1}" style="margin-bottom:8px">
            <div>
              <p style="font-weight:500;font-size:13px;color:var(--text-primary)">${s.name}</p>
              <p style="font-size:11px;color:var(--text-dimmed)">${s.desc}</p>
            </div>
            <span style="color:var(--text-dimmed);flex-shrink:0">${Icons.link(14)}</span>
          </div>
        `).join('')}

        <h3 class="h3-label mt-20">${t.streamsNews}</h3>
        <div class="card-inner text-center" style="padding:24px">
          <div style="color:var(--text-dimmed);margin-bottom:8px">${Icons.clock(32)}</div>
          <p style="font-size:13px;color:var(--text-dimmed)">${t.noData}</p>
        </div>
      </div>
    </div>`;
}
