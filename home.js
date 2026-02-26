/* ═══════════════════════════════════════
   HAIAL — Home Page (Table + Checker)
   ═══════════════════════════════════════ */

// Shared helpers
function renderBadge(category, emoji, t) {
  const cls = 'badge badge-' + category.toLowerCase();
  const label = t[category.toLowerCase()] || category;
  return `<span class="${cls}">${emoji} ${label}</span>`;
}

function renderProof(p) {
  const txt = p.score === 0 ? '0' : p.score + (p.stars > 0 ? '★'.repeat(p.stars) : '');
  const cls = p.score === 100 && p.stars >= 1 ? 'proof-maxstar' : p.score === 100 ? 'proof-max' : p.score >= 85 ? 'proof-high' : p.score >= 70 ? 'proof-mid' : 'proof-low';
  return `<span class="proof ${cls}">${txt}</span>`;
}

function renderTrend(v) {
  if (v === 'up') return `<span class="trend-up">${Icons.trendUp()}</span>`;
  if (v === 'down') return `<span class="trend-down">${Icons.trendDown()}</span>`;
  return `<span class="trend-neutral">${Icons.minus()}</span>`;
}

function renderFatwaIcon(category) {
  if (category === 'Halal') return `<span class="fatwa-icon" style="color:#22c55e">${Icons.check(14)}</span>`;
  if (category === 'Haram') return `<span class="fatwa-icon" style="color:#ef4444">${Icons.xCircle(14)}</span>`;
  return `<span class="fatwa-icon" style="color:#eab308">${Icons.alert(14)}</span>`;
}

// ── Coin Modal ──
function renderModal(coin, t, onClose) {
  if (!coin) return '';
  return `
    <div class="modal-overlay animate-fade-in" onclick="closeModal(event)">
      <div class="modal-bg"></div>
      <div class="modal-content animate-fade-up" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-coin-info">
            <span class="modal-coin-emoji">${coin.emoji}</span>
            <div>
              <div class="modal-coin-name">${coin.name}</div>
              <div class="modal-coin-ticker">${coin.ticker}</div>
            </div>
          </div>
          <button class="modal-close" onclick="closeModal()">${Icons.x()}</button>
        </div>
        <div class="modal-body">
          <div class="modal-status">
            ${renderBadge(coin.category, coin.emoji, t)}
            <div class="modal-proof">${t.sourcesStatusLabel}: ${renderProof(coin.proof)}</div>
          </div>
          <div class="reason-box">
            <div class="reason-title">${Icons.shield(16)} ${t.reasoning}</div>
            <div class="reason-text">${coin.reasoning}</div>
          </div>
          <div class="grid-2">
            <div class="card-inner">
              <div class="h4-label">${t.businessModel}</div>
              <p style="font-size:12px;color:var(--text-muted)">${coin.businessModel}</p>
            </div>
            <div class="card-inner">
              <div class="h4-label">${t.tokenomics}</div>
              <p style="font-size:12px;color:var(--text-muted)">${coin.tokenomics}</p>
            </div>
          </div>
          <div class="card-inner">
            <div class="h4-label" style="margin-bottom:10px">${t.fatwaReferences}</div>
            ${coin.fatwas.map(fw => `
              <div class="fatwa-item">${renderFatwaIcon(coin.category)} ${fw}</div>
            `).join('')}
          </div>
          <div class="modal-footer">
            <span>${t.updated}: ${coin.updated}</span>
            <span>${t.verificationSources}: ${coin.sources.length ? coin.sources.join(', ') : '—'}</span>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Coin Table ──
function renderCoinTable(t, isRTL) {
  const PER_PAGE = 8;
  const total = Math.ceil(COINS.length / PER_PAGE);
  const pg = window._haialPage || 1;
  const start = (pg - 1) * PER_PAGE;
  const cur = COINS.slice(start, start + PER_PAGE);
  const align = isRTL ? 'text-align:right' : 'text-align:left';

  const headers = [t.coin, t.ticker, t.haialStatus, t.sourcesStatus, t.trend, t.updated];

  return `
    <div class="card full-h flex-col animate-fade-up">
      <div class="mb-12">
        <h2 style="font-size:17px;font-weight:700;color:var(--text-primary)">${t.coinDatabase}</h2>
        <p style="font-size:11px;margin-top:4px;color:var(--text-dimmed)">
          ${t.clickForAnalysis} — ${t.showing} ${start+1}-${Math.min(start+PER_PAGE, COINS.length)} ${t.of} ${COINS.length} ${t.coins}
        </p>
      </div>
      <div class="flex-1 overflow-auto">
        <table class="coin-table">
          <thead>
            <tr>${headers.map(h => `<th style="${align}">${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${cur.map((c, i) => `
              <tr class="coin-row" onclick="openCoinModal(${start + i})">
                <td class="coin-name">${c.name}</td>
                <td class="coin-ticker">${c.ticker}</td>
                <td>${renderBadge(c.category, c.emoji, t)}</td>
                <td>${renderProof(c.proof)}</td>
                <td>${renderTrend(c.trend)}</td>
                <td class="coin-date">${c.updated}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${total > 1 ? `
        <div class="pagination">
          <button class="page-btn" ${pg===1?'disabled':''} onclick="changePage(${pg-1})">
            ${Icons.chevLeft()} ${t.previous}
          </button>
          <span class="page-info">${pg} / ${total}</span>
          <button class="page-btn" ${pg===total?'disabled':''} onclick="changePage(${pg+1})">
            ${t.next} ${Icons.chevRight()}
          </button>
        </div>
      ` : ''}
    </div>`;
}

// ── AI Checker ──
function renderChecker(t) {
  const result = window._haialResult;
  const search = window._haialSearch || '';

  let body;
  if (result === undefined || result === null) {
    body = `
      <div class="checker-placeholder" style="flex:1">
        <div>
          <div style="opacity:0.2;margin-bottom:12px">${Icons.search(48)}</div>
          <p style="font-size:13px">${t.enterCoin}</p>
        </div>
      </div>`;
  } else if (result === 'nf') {
    body = `
      <div class="info-box">
        <div class="info-title">${Icons.info(18)} ${t.coinNotFound}</div>
        <p style="font-size:13px;color:var(--text-secondary)">${t.uploadDocs}</p>
        <button class="try-btn try-btn-info" onclick="resetChecker()">${t.tryAnother}</button>
      </div>`;
  } else {
    body = `
      <div class="flex-col gap-12">
        <div class="text-center" style="padding:12px 0">
          <div style="font-size:40px;margin-bottom:4px">${result.emoji}</div>
          <h3 style="font-size:18px;font-weight:700;color:var(--text-primary)">${result.name}</h3>
          <p style="font-size:11px;margin-top:4px;color:var(--text-muted)">${t.category}: ${t[result.category.toLowerCase()] || result.category}</p>
        </div>
        <div class="reason-box">
          <div style="font-weight:600;margin-bottom:4px;font-size:12px;color:var(--text-accent)">${t.reasoning}</div>
          <p style="font-size:11px;line-height:1.5;color:var(--text-secondary)">${result.reasoning}</p>
        </div>
        <div class="flex justify-between" style="font-size:12px;color:var(--text-muted)">
          <span>${t.sourcesStatusLabel}:</span> ${renderProof(result.proof)}
        </div>
        <button class="try-btn try-btn-default" onclick="resetChecker()">${t.tryAnother}</button>
      </div>`;
  }

  return `
    <div class="card full-h flex-col animate-fade-up stagger-2">
      <h2 style="font-size:17px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px;color:var(--text-primary)">
        <span style="color:#10b981">${Icons.shield(18)}</span> ${t.aiChecker}
      </h2>
      <div class="checker-input">
        <input type="text" class="checker-field" placeholder="${t.enterCoin}" value="${search}" oninput="window._haialSearch=this.value" onkeydown="if(event.key==='Enter')doCheck()">
        <button class="checker-btn" onclick="doCheck()">${Icons.search(16)}</button>
      </div>
      <div class="flex-1 overflow-auto">${body}</div>
    </div>`;
}

// ── Home page layout ──
function renderHomePage(t, isRTL) {
  return `
    <div class="grid-home">
      <div>${renderCoinTable(t, isRTL)}</div>
      <div>${renderChecker(t)}</div>
    </div>`;
}
