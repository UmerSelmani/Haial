/* ═══════════════════════════════════════
   HAIAL v9.3 — Streams Page (Live RSS Feeds)
   Table 1: All Islamic Sources
   Table 2: Halal Coin News (all sources, coin-filtered)
   + original text with translation below
   ═══════════════════════════════════════ */

// ── RSS Feed Configuration ──
const RSS_FEEDS = {
  islamic: [
    { id: 'ifg',      name: 'Islamic Finance Guru',      url: 'https://www.islamicfinanceguru.com/feed', color: '#10b981' },
    { id: 'pif',      name: 'Practical Islamic Finance',  url: 'https://www.practicalislamicfinance.com/blog-feed.xml', color: '#3b82f6' },
    { id: 'musaffa',  name: 'Musaffa Academy',            url: 'https://academy.musaffa.com/feed', color: '#8b5cf6' },
    { id: 'amanah',   name: 'Amanah Advisors',            url: 'https://amanahadvisors.com/feed/', color: '#f59e0b' },
    { id: 'sharlife', name: 'Sharlife',                    url: 'https://sharlife.com/feed/', color: '#ec4899' },
    { id: 'ukifc',    name: 'UK Islamic Finance Council',  url: 'https://www.ukifc.com/feed/', color: '#14b8a6' },
  ],
  crypto: [
    { id: 'cointelegraph', name: 'CoinTelegraph',    url: 'https://cointelegraph.com/rss', color: '#f59e0b' },
    { id: 'coindesk',      name: 'CoinDesk',         url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', color: '#6366f1' },
    { id: 'bitcoinmag',    name: 'Bitcoin Magazine',  url: 'https://bitcoinmagazine.com/feed', color: '#f97316' },
    { id: 'decrypt',       name: 'Decrypt',           url: 'https://decrypt.co/feed', color: '#ec4899' },
  ]
};

const COIN_TICKERS = COINS.map(c => ({ ticker: c.ticker, name: c.name.toLowerCase() }));
const RSS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';

const _feedCache = {};
const CACHE_TTL = 5 * 60 * 1000;

// ── Simple translation map for common news phrases ──
const LANG_NAMES = { en: 'English', ar: 'العربية', tr: 'Türkçe', sq: 'Shqip', ru: 'Русский' };

async function translateText(text, lang) {
  // For non-English, show a note that original is in English
  if (!lang || lang === 'en' || !text) return null;
  var labels = { ar: 'الأصلي بالإنجليزية', tr: 'İngilizce orijinal', sq: 'Origjinali në anglisht', ru: 'Оригинал на английском' };
  return labels[lang] || null;
}

// ── Fetch single feed ──
async function fetchFeed(feedConfig) {
  const cacheKey = feedConfig.id;
  const cached = _feedCache[cacheKey];
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const resp = await fetch(RSS_PROXY + encodeURIComponent(feedConfig.url));
    if (!resp.ok) throw new Error(resp.status);
    const json = await resp.json();
    if (json.status !== 'ok' || !json.items) throw new Error('Bad feed');

    const items = json.items.slice(0, 15).map(item => ({
      title: item.title || '',
      link: item.link || '',
      date: item.pubDate || '',
      desc: stripHTML(item.description || '').slice(0, 200),
      source: feedConfig.name,
      sourceId: feedConfig.id,
      sourceColor: feedConfig.color,
      coins: detectCoins(item.title + ' ' + (item.description || '')),
    }));

    _feedCache[cacheKey] = { ts: Date.now(), data: items };
    return items;
  } catch (e) {
    console.warn('Feed failed:', feedConfig.name, e.message);
    return [];
  }
}

async function fetchAllFeeds(category) {
  const feeds = RSS_FEEDS[category] || [];
  const results = await Promise.allSettled(feeds.map(f => fetchFeed(f)));
  const all = [];
  results.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value); });
  all.sort((a, b) => new Date(b.date) - new Date(a.date));
  return all;
}

// ── Helpers ──
function stripHTML(str) {
  const tmp = document.createElement('div');
  tmp.innerHTML = str;
  return tmp.textContent || tmp.innerText || '';
}

function detectCoins(text) {
  const upper = text.toUpperCase();
  const found = [];
  COIN_TICKERS.forEach(c => {
    const rx = new RegExp('\\b' + c.ticker + '\\b');
    if (rx.test(upper) || upper.includes(c.name.toUpperCase())) {
      found.push(c.ticker);
    }
  });
  return [...new Set(found)];
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  var mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  var days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return d.toLocaleDateString();
}

function coinBadge(ticker) {
  const coin = COINS.find(c => c.ticker === ticker);
  if (!coin) return '';
  const cls = coin.category === 'Halal' ? 'badge-halal' : coin.category === 'Haram' ? 'badge-haram' : 'badge-review';
  return '<span class="badge ' + cls + '" style="font-size:10px;padding:1px 5px">' + ticker + '</span>';
}

function sourceBadge(name, color) {
  return '<span style="display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;background:' + color + '22;color:' + color + ';border:1px solid ' + color + '44">' +
    '<span style="width:5px;height:5px;border-radius:50%;background:' + color + ';display:inline-block"></span> ' +
    name + '</span>';
}

// ── Render news item (original + translation note) ──
function renderNewsItem(item) {
  var coinTags = item.coins.length ? item.coins.map(coinBadge).join(' ') : '';
  var lang = window._haialLang || 'en';

  // Translation note for non-English users
  var transNote = '';
  if (lang !== 'en') {
    var labels = { ar: 'المحتوى الأصلي بالإنجليزية', tr: 'Orijinal içerik İngilizce', sq: 'Përmbajtja origjinale në anglisht', ru: 'Оригинал на английском' };
    transNote = '<div class="stream-trans-note">[' + (labels[lang] || '') + ']</div>';
  }

  return '<a href="' + item.link + '" target="_blank" rel="noopener" class="stream-item glow-card" style="text-decoration:none;display:block">' +
    '<div class="flex items-center justify-between mb-6" style="flex-wrap:wrap;gap:6px">' +
      sourceBadge(item.source, item.sourceColor) +
      '<span style="font-size:10px;color:var(--text-dimmed)">' + timeAgo(item.date) + '</span>' +
    '</div>' +
    '<h4 style="font-size:13px;font-weight:600;color:var(--text-primary);line-height:1.4;margin-bottom:4px">' + item.title + '</h4>' +
    transNote +
    (item.desc ? '<p style="font-size:11px;color:var(--text-muted);line-height:1.5;margin-bottom:6px">' + item.desc + '...</p>' : '') +
    (coinTags ? '<div class="flex gap-8" style="flex-wrap:wrap">' + coinTags + '</div>' : '') +
  '</a>';
}

// ── Render coin news item (no source badge, coins only) ──
function renderCoinNewsItem(item) {
  var coinTags = item.coins.length ? item.coins.map(coinBadge).join(' ') : '';
  var lang = window._haialLang || 'en';

  var transNote = '';
  if (lang !== 'en') {
    var labels = { ar: 'المحتوى الأصلي بالإنجليزية', tr: 'Orijinal içerik İngilizce', sq: 'Përmbajtja origjinale në anglisht', ru: 'Оригинал на английском' };
    transNote = '<div class="stream-trans-note">[' + (labels[lang] || '') + ']</div>';
  }

  return '<a href="' + item.link + '" target="_blank" rel="noopener" class="stream-item glow-card" style="text-decoration:none;display:block">' +
    '<div class="flex items-center justify-between mb-6" style="flex-wrap:wrap;gap:6px">' +
      (coinTags ? '<div class="flex gap-8" style="flex-wrap:wrap">' + coinTags + '</div>' : '') +
      '<span style="font-size:10px;color:var(--text-dimmed)">' + timeAgo(item.date) + '</span>' +
    '</div>' +
    '<h4 style="font-size:13px;font-weight:600;color:var(--text-primary);line-height:1.4;margin-bottom:4px">' + item.title + '</h4>' +
    transNote +
    (item.desc ? '<p style="font-size:11px;color:var(--text-muted);line-height:1.5;margin-bottom:0">' + item.desc + '...</p>' : '') +
  '</a>';
}

// ── Skeleton ──
function renderSkeleton(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += '<div class="stream-item" style="opacity:0.4">' +
      '<div style="height:12px;width:80px;border-radius:4px;background:var(--border-primary);margin-bottom:10px"></div>' +
      '<div style="height:14px;width:90%;border-radius:4px;background:var(--border-primary);margin-bottom:8px"></div>' +
      '<div style="height:11px;width:70%;border-radius:4px;background:var(--border-primary)"></div>' +
    '</div>';
  }
  return html;
}

// ── Coin filter bar ──
function renderCoinFilter() {
  var coins = COINS.filter(function(c) { return c.category === 'Halal'; });
  var t = I18N[window._haialLang || 'en'] || I18N.en;
  return '<div class="stream-filter" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">' +
    '<button class="stream-filter-btn active" onclick="filterCoinNews(\'all\')" data-coin="all">' + t.all + '</button>' +
    coins.map(c =>
      '<button class="stream-filter-btn" onclick="filterCoinNews(\'' + c.ticker + '\')" data-coin="' + c.ticker + '">' + c.ticker + '</button>'
    ).join('') +
  '</div>';
}

// ── Main streams page ──
function renderStreamsPage(t) {
  setTimeout(function() { loadIslamicFeeds(); }, 50);
  setTimeout(function() { loadCryptoFeeds(); }, 100);

  return '<div style="max-width:1000px;margin:0 auto">' +
    '<div class="text-center mb-20 animate-fade-up">' +
      '<h1 class="section-title">' + Icons.eye(24) + ' ' + t.verifiedSources + '</h1>' +
      '<p class="section-subtitle">' + t.verifiedSourcesDesc + '</p>' +
    '</div>' +
    '<div class="stream-grid">' +
      '<div class="card animate-fade-up stagger-1" style="padding:20px">' +
        '<div class="flex items-center justify-between mb-12">' +
          '<h2 style="font-size:16px;font-weight:700;color:var(--text-accent-dark)">' + String.fromCodePoint(0x1F54C) + ' ' + t.streamsIslamic + '</h2>' +
          '<button class="stream-refresh-btn" onclick="loadIslamicFeeds(true)" title="Refresh">' + String.fromCodePoint(0x21BB) + '</button>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--text-dimmed);margin-bottom:14px;display:flex;flex-wrap:wrap;gap:4px">' +
          RSS_FEEDS.islamic.map(function(f) { return sourceBadge(f.name, f.color); }).join(' ') +
        '</div>' +
        '<div id="islamicFeed" class="stream-list">' + renderSkeleton(4) + '</div>' +
      '</div>' +
      '<div class="card animate-fade-up stagger-2" style="padding:20px">' +
        '<div class="flex items-center justify-between mb-12">' +
          '<h2 style="font-size:16px;font-weight:700;color:var(--text-accent-dark)">' + String.fromCodePoint(0x1F4B0) + ' ' + t.streamsNews + '</h2>' +
          '<button class="stream-refresh-btn" onclick="loadCryptoFeeds(true)" title="Refresh">' + String.fromCodePoint(0x21BB) + '</button>' +
        '</div>' +
        renderCoinFilter() +
        '<div id="cryptoFeed" class="stream-list">' + renderSkeleton(4) + '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

// ── Load Islamic feeds ──
async function loadIslamicFeeds(force) {
  if (force) RSS_FEEDS.islamic.forEach(function(f) { delete _feedCache[f.id]; });
  var el = document.getElementById('islamicFeed');
  if (!el) return;

  var items = await fetchAllFeeds('islamic');
  if (!document.getElementById('islamicFeed')) return;

  if (items.length === 0) {
    el.innerHTML = '<div class="text-center" style="padding:24px;color:var(--text-dimmed)">' +
      '<p style="font-size:12px">Could not load feeds. Check connection and try again.</p></div>';
    return;
  }
  el.innerHTML = items.slice(0, 25).map(renderNewsItem).join('');
}

// ── Halal tickers only ──
var HALAL_TICKERS = COINS.filter(function(c) { return c.category === 'Halal'; }).map(function(c) { return c.ticker; });

var _allCryptoItems = [];

async function loadCryptoFeeds(force) {
  if (force) {
    RSS_FEEDS.crypto.forEach(function(f) { delete _feedCache[f.id]; });
    RSS_FEEDS.islamic.forEach(function(f) { delete _feedCache[f.id]; });
  }
  var el = document.getElementById('cryptoFeed');
  if (!el) return;

  // Fetch from BOTH crypto and islamic sources
  var cryptoItems = await fetchAllFeeds('crypto');
  var islamicItems = await fetchAllFeeds('islamic');
  var raw = cryptoItems.concat(islamicItems);
  raw.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

  if (!document.getElementById('cryptoFeed')) return;

  // Deduplicate by link
  var seen = {};
  raw = raw.filter(function(item) {
    if (seen[item.link]) return false;
    seen[item.link] = true;
    return true;
  });

  _allCryptoItems = raw.filter(function(item) {
    return item.coins.some(function(t) { return HALAL_TICKERS.includes(t); });
  });
  _allCryptoItems.forEach(function(item) {
    item.coins = item.coins.filter(function(t) { return HALAL_TICKERS.includes(t); });
  });

  filterCoinNews(window._streamCoinFilter || 'all');
}

function filterCoinNews(ticker) {
  window._streamCoinFilter = ticker;
  var el = document.getElementById('cryptoFeed');
  if (!el) return;

  document.querySelectorAll('.stream-filter-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.coin === ticker);
  });

  var filtered;
  if (ticker === 'all') {
    filtered = _allCryptoItems;
  } else {
    filtered = _allCryptoItems.filter(function(item) { return item.coins.includes(ticker); });
  }

  if (filtered.length === 0) {
    var t = I18N[window._haialLang || 'en'] || I18N.en;
    el.innerHTML = '<div class="text-center" style="padding:24px;color:var(--text-dimmed)">' +
      '<p style="font-size:12px">' + (ticker === 'all' ? t.noData : t.noNewsFor + ' ' + ticker) + '</p></div>';
    return;
  }
  el.innerHTML = filtered.slice(0, 25).map(renderCoinNewsItem).join('');
}
