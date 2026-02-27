/* ═══════════════════════════════════════
   HAIAL — Main Application v9.2
   Faith. Data. Clarity.
   © Haial Project 2025–2026 — Umer Selmani
   ═══════════════════════════════════════ */

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
  // Init page-level state
  window._haialPage = 1;
  window._haialSearch = '';
  window._haialResult = null;
})();

// ── Helpers ──
function t() { return I18N[State.lang] || I18N.en; }
function isRTL() { return RTL_LANGS.includes(State.lang); }

function save(key, val) {
  try { localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)); } catch {}
}

// ── Actions ──
function setPage(pg) {
  State.page = pg;
  render();
}

function setLang(lang) {
  State.lang = lang;
  window._haialLang = lang;
  save('haial-lang', lang);
  document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  render();
}

function toggleDark() {
  State.dark = !State.dark;
  save('haial-dark', State.dark);
  render();
}

function openCoinModal(idx) {
  State.selectedCoin = COINS[idx] || null;
  render();
}

function closeModal(event) {
  if (event && event.target && !event.target.closest('.modal-content') && !event.target.classList.contains('modal-close')) {
    // clicked backdrop
  }
  State.selectedCoin = null;
  render();
}

function changePage(pg) {
  window._haialPage = pg;
  render();
}

function doCheck() {
  const s = (window._haialSearch || '').trim().toLowerCase();
  if (!s) return;
  const coin = COINS.find(c => c.ticker.toLowerCase() === s || c.name.toLowerCase() === s);
  window._haialResult = coin || 'nf';
  render();
}

function resetChecker() {
  window._haialSearch = '';
  window._haialResult = null;
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

  // Apply theme
  document.documentElement.setAttribute('data-theme', State.dark ? 'dark' : 'light');

  // ── Header ──
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

  // ── Nav ──
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

  // ── Page content ──
  let page = '';
  switch (State.page) {
    case 'home':    page = renderHomePage($, rtl); break;
    case 'streams': page = renderStreamsPage($); break;
    case 'learn':   page = renderLearnPage($); break;
    case 'signals': page = renderSignalsPage($); break;
    case 'about':   page = renderAboutPage($); break;
  }

  // ── Footer ──
  const footer = `
    <footer class="footer">
      <div class="footer-inner">
        <p class="footer-copy">${$.copyright}</p>
        <p class="footer-version">${$.versionFooter}</p>
      </div>
    </footer>`;

  // ── Modal ──
  const modal = renderModal(State.selectedCoin, $);

  // ── Assemble ──
  root.innerHTML = header + nav + `
    <main style="max-width:1200px;margin:0 auto;padding:20px 16px">
      ${page}
    </main>
  ` + footer + modal;
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
  document.documentElement.lang = State.lang;
  render();
});
