/* ═══════════════════════════════════════
   HAIAL — Main Application v9.4
   Faith. Data. Clarity.
   3-Tier AI Compliance Checker
   © Haial Project 2025–2026 — Umer Selmani
   ═══════════════════════════════════════ */

// ── Config ──
const HAIAL_AI_ENDPOINT = 'https://haial-ai.YOUR_SUBDOMAIN.workers.dev'; // ← Update after deploying worker

// ── State ──
const State = {
  page: 'home',
  lang: 'en',
  dark: true,
  selectedCoin: null,
};

// ── Init from localStorage ──
(function initState() {
  try {
    const d = localStorage.getItem('haial-dark');
    if (d !== null) State.dark = JSON.parse(d);
  } catch {}
  try {
    const l = localStorage.getItem('haial-lang');
    if (l && I18N[l]) State.lang = l;
    window._haialLang = State.lang;
  } catch {}
  window._haialPage = 1;
  window._haialSearch = '';
  window._haialResult = null;
  window._haialResultTier = null; // 'db', 'extended', 'ai'
  window._haialLoading = false;
  window._haialAiRemaining = null;
  try {
    const stored = localStorage.getItem('haial-ai-remaining');
    if (stored !== null) window._haialAiRemaining = parseInt(stored);
  } catch {}
})();

// ── Helpers ──
function t() { return I18N[State.lang] || I18N.en; }
function isRTL() { return RTL_LANGS.includes(State.lang); }
function save(key, val) {
  try { localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)); } catch {}
}

// ── Actions ──
function setPage(pg) { State.page = pg; render(); }
function setLang(lang) {
  State.lang = lang; window._haialLang = lang;
  save('haial-lang', lang);
  document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  render();
}
function toggleDark() { State.dark = !State.dark; save('haial-dark', State.dark); render(); }
function openCoinModal(idx) { State.selectedCoin = COINS[idx] || null; render(); }
function closeModal(event) {
  if (event && event.target && !event.target.closest('.modal-content') && !event.target.classList.contains('modal-close')) {}
  State.selectedCoin = null; render();
}
function changePage(pg) { window._haialPage = pg; render(); }

// ═══════════════════════════════════════
// 3-TIER CHECKER
// Tier 1: Main database (COINS)
// Tier 2: Extended source database (EXTENDED_COINS)
// Tier 3: AI Analysis (Cloudflare Worker → Anthropic)
// ═══════════════════════════════════════

function doCheck() {
  const s = (window._haialSearch || '').trim().toLowerCase();
  if (!s) return;

  // ── Tier 1: Main database ──
  const dbCoin = COINS.find(c => c.ticker.toLowerCase() === s || c.name.toLowerCase() === s);
  if (dbCoin) {
    window._haialResult = dbCoin;
    window._haialResultTier = 'db';
    render();
    return;
  }

  // ── Tier 2: Extended source database ──
  const extCoin = findExtendedCoin(s);
  if (extCoin) {
    window._haialResult = extCoin;
    window._haialResultTier = 'extended';
    render();
    return;
  }

  // ── Tier 3: AI Analysis ──
  doAiCheck(s);
}

async function doAiCheck(query) {
  window._haialLoading = true;
  window._haialResult = null;
  window._haialResultTier = null;
  render();

  try {
    const response = await fetch(HAIAL_AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coin: query, ticker: query.toUpperCase() }),
    });
    const data = await response.json();

    if (response.status === 429) {
      window._haialResult = 'rate_limited';
      window._haialAiRemaining = 0;
      save('haial-ai-remaining', '0');
    } else if (data.success && data.analysis) {
      window._haialResult = data.analysis;
      window._haialResultTier = 'ai';
      if (data.remaining !== undefined) {
        window._haialAiRemaining = data.remaining;
        save('haial-ai-remaining', String(data.remaining));
      }
    } else {
      window._haialResult = 'error';
    }
  } catch (err) {
    console.error('Haial AI error:', err);
    window._haialResult = 'offline';
  }

  window._haialLoading = false;
  render();
}

async function doAiWhitepaper() {
  const wpText = (document.getElementById('haial-wp-input') || {}).value || '';
  if (!wpText.trim()) return;
  const coinName = (window._haialResult && window._haialResult.coin) || window._haialSearch;
  const coinTicker = (window._haialResult && window._haialResult.ticker) || coinName.toUpperCase();

  window._haialLoading = true;
  render();

  try {
    const response = await fetch(HAIAL_AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coin: coinName, ticker: coinTicker, whitepaper: wpText }),
    });
    const data = await response.json();

    if (response.status === 429) {
      window._haialResult = 'rate_limited';
      window._haialResultTier = null;
    } else if (data.success && data.analysis) {
      data.analysis._hasWhitepaper = true;
      window._haialResult = data.analysis;
      window._haialResultTier = 'ai';
      if (data.remaining !== undefined) {
        window._haialAiRemaining = data.remaining;
        save('haial-ai-remaining', String(data.remaining));
      }
    }
  } catch (err) { console.error('Haial AI whitepaper error:', err); }

  window._haialLoading = false;
  render();
}

function resetChecker() {
  window._haialSearch = '';
  window._haialResult = null;
  window._haialResultTier = null;
  window._haialLoading = false;
  render();
}

// ── Nav items ──
const NAV_ITEMS = [
  { id: 'home',    icon: '🏠' },
  { id: 'streams', icon: '📡' },
  { id: 'learn',   icon: '📖' },
  { id: 'signals', icon: '📊' },
  { id: 'about',   icon: '👤' },
];

// ── Render Engine ──
function render() {
  const $ = t();
  const rtl = isRTL();
  const root = document.getElementById('app');
  document.documentElement.setAttribute('data-theme', State.dark ? 'dark' : 'light');

  const header = `
    <header class="header">
      <div class="header-inner">
        <div>
          <h1 class="header-title">Haial</h1>
          <p class="header-tagline">${$.tagline}</p>
        </div>
        <div class="header-controls">
          <select class="lang-select" onchange="setLang(this.value)">
            <option value="en" ${State.lang==='en'?'selected':''}>🇬🇧 English</option>
            <option value="ar" ${State.lang==='ar'?'selected':''}>🇸🇦 العربية</option>
            <option value="tr" ${State.lang==='tr'?'selected':''}>🇹🇷 Türkçe</option>
            <option value="sq" ${State.lang==='sq'?'selected':''}>🇦🇱 Shqip</option>
            <option value="ru" ${State.lang==='ru'?'selected':''}>🇷🇺 Русский</option>
          </select>
          <button class="theme-btn" onclick="toggleDark()" title="${State.dark ? $.lightMode : $.darkMode}">
            ${State.dark ? Icons.sun() : Icons.moon()}
          </button>
          <div class="header-version">
            <div class="header-version-num">${$.version}</div>
            <div class="header-version-desc">${$.versionDesc}</div>
          </div>
        </div>
      </div>
    </header>`;

  const nav = `
    <nav class="nav">
      <div class="nav-inner">
        ${NAV_ITEMS.map(item => `
          <button class="nav-btn ${State.page === item.id ? 'active' : ''}" onclick="setPage('${item.id}')">
            <span>${item.icon}</span> ${$[item.id]}
          </button>
        `).join('')}
      </div>
    </nav>`;

  let page = '';
  switch (State.page) {
    case 'home':    page = renderHomePage($, rtl); break;
    case 'streams': page = renderStreamsPage($); break;
    case 'learn':   page = renderLearnPage($); break;
    case 'signals': page = renderSignalsPage($); break;
    case 'about':   page = renderAboutPage($); break;
  }

  const footer = `
    <footer class="footer">
      <div class="footer-inner">
        <p class="footer-copy">${$.copyright}</p>
        <p class="footer-version">${$.versionFooter}</p>
      </div>
    </footer>`;

  const modal = renderModal(State.selectedCoin, $);

  root.innerHTML = header + nav + `
    <main style="max-width:1200px;margin:0 auto;padding:20px 16px">${page}</main>
  ` + footer + modal;
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
  document.documentElement.lang = State.lang;
  render();
});
