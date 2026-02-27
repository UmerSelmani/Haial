/* ═══════════════════════════════════════
   HAIAL v9.2 — Home Page (Table + Checker)
   ═══════════════════════════════════════ */

function renderBadge(category, emoji, t) {
  var cls = 'badge badge-' + category.toLowerCase();
  var label = t[category.toLowerCase()] || category;
  return '<span class="' + cls + '">' + emoji + ' ' + label + '</span>';
}

function renderProof(p) {
  var starHtml = p.stars > 0 ? ' <span class="proof-stars">(' + '\u2605'.repeat(p.stars) + ')</span>' : '';
  var txt = p.score === 0 ? '0' : String(p.score);
  var cls = p.score === 100 && p.stars >= 1 ? 'proof-maxstar' : p.score === 100 ? 'proof-max' : p.score >= 85 ? 'proof-high' : p.score >= 70 ? 'proof-mid' : 'proof-low';
  return '<span class="proof ' + cls + '">' + txt + starHtml + '</span>';
}

function renderTrend(v) {
  if (v === 'up') return '<span class="trend-up">' + Icons.trendUp() + '</span>';
  if (v === 'down') return '<span class="trend-down">' + Icons.trendDown() + '</span>';
  return '<span class="trend-neutral">' + Icons.minus() + '</span>';
}

function renderFatwaIcon(opinion) {
  if (opinion === 'halal') return '<span class="fatwa-icon" style="color:#22c55e">' + Icons.check(14) + '</span>';
  if (opinion === 'haram') return '<span class="fatwa-icon" style="color:#ef4444">' + Icons.xCircle(14) + '</span>';
  if (opinion === 'caution') return '<span class="fatwa-icon" style="color:#f59e0b">' + Icons.alert(14) + '</span>';
  return '<span class="fatwa-icon" style="color:#eab308">' + Icons.alert(14) + '</span>';
}

function render24hChange(ticker) {
  var id = 'price24h-' + ticker;
  fetch24hChange(ticker).then(function(d) {
    var el = document.getElementById(id);
    if (!el || !d) return;
    var pct = d.change.toFixed(2);
    var cls = d.change >= 0 ? 'change-pos' : 'change-neg';
    var sign = d.change >= 0 ? '+' : '';
    el.innerHTML = '<span class="' + cls + '">' + sign + pct + '%</span>';
  });
  return '<span id="' + id + '" class="change-loading">...</span>';
}

// ── Coin Modal ──
function renderModal(coin, t, onClose) {
  if (!coin) return '';
  var lang = window._haialLang || 'en';

  var reasoning = locStr(coin.reasoning, lang);
  var bizModel = locStr(coin.businessModel, lang);
  var tokenomics = locStr(coin.tokenomics, lang);
  var proofExp = locStr(coin.proofExplanation, lang);
  var statusExp = locStr(coin.statusExplanation, lang);

  // Build fatwa rows with per-review opinion badges
  var fatwaRows = coin.fatwas.map(function(fw) {
    var opLabel = t[fw.opinion] || fw.opinion;
    var calcTag = fw.inCalc ? '' : ' <span class="source-no-calc">' + t.notInCalc + '</span>';
    return '<div class="fatwa-item">' + renderFatwaIcon(fw.opinion) +
      '<strong>' + fw.fullName + '</strong>' + calcTag +
      ' <span class="fatwa-opinion fatwa-op-' + fw.opinion + '">(' + opLabel + ')</span> — ' + fw.note +
      '</div>';
  }).join('');

  // Show all sources: reviewed ones active, unreviewed = not in calculation
  var allSourceKeys = Object.keys(SOURCE_AUTHORITY);
  var reviewedKeys = coin.sources;
  var sourceListHtml = allSourceKeys.map(function(key) {
    var auth = SOURCE_AUTHORITY[key];
    var reviewed = reviewedKeys.indexOf(key) >= 0;
    if (reviewed) {
      var noCalcTag = auth.weight === 0 ? ' <span class="source-no-calc">' + t.notInCalc + '</span>' : '';
      return '<span class="source-tag source-active">' + auth.fullName + noCalcTag + '</span>';
    } else {
      return '<span class="source-tag source-pending">' + auth.fullName + ' <span class="source-no-calc">' + t.notInCalc + '</span></span>';
    }
  }).join(' ');

  // Live price
  var priceId = 'modal24h-' + coin.ticker;
  fetch24hChange(coin.ticker).then(function(d) {
    var el = document.getElementById(priceId);
    if (!el || !d) return;
    var pct = d.change.toFixed(2);
    var cls = d.change >= 0 ? 'change-pos' : 'change-neg';
    var sign = d.change >= 0 ? '+' : '';
    el.innerHTML = '$' + d.price.toLocaleString(undefined, {maximumFractionDigits:4}) +
      ' <span class="' + cls + '">(' + sign + pct + '%)</span>';
  });

  return '\
    <div class="modal-overlay animate-fade-in" onclick="closeModal(event)">\
      <div class="modal-bg"></div>\
      <div class="modal-content animate-fade-up" onclick="event.stopPropagation()">\
        <div class="modal-header">\
          <div class="modal-coin-info">\
            <span class="modal-coin-emoji">' + coin.emoji + '</span>\
            <div>\
              <div class="modal-coin-name">' + coin.name + '</div>\
              <div class="modal-coin-ticker">' + coin.ticker + ' <span id="' + priceId + '" style="font-size:11px;color:var(--text-muted)">...</span></div>\
            </div>\
          </div>\
          <button class="modal-close" onclick="closeModal()">' + Icons.x() + '</button>\
        </div>\
        <div class="modal-body">\
          <div class="modal-status">\
            ' + renderBadge(coin.category, coin.emoji, t) + '\
            <div class="modal-proof">' + t.sourcesStatusLabel + ': ' + renderProof(coin.proof) + '</div>\
          </div>\
\
          <div class="reason-box">\
            <div class="reason-title">' + Icons.shield(16) + ' ' + t.reasoning + '</div>\
            <div class="reason-text">' + reasoning + '</div>\
          </div>\
\
          <div class="grid-2">\
            <div class="card-inner">\
              <div class="h4-label">' + t.businessModel + '</div>\
              <p style="font-size:12px;color:var(--text-muted)">' + bizModel + '</p>\
            </div>\
            <div class="card-inner">\
              <div class="h4-label">' + t.tokenomics + '</div>\
              <p style="font-size:12px;color:var(--text-muted)">' + tokenomics + '</p>\
            </div>\
          </div>\
\
          <div class="card-inner">\
            <div class="h4-label" style="margin-bottom:10px">' + t.fatwaReferences + '</div>\
            ' + fatwaRows + '\
          </div>\
\
          <div class="card-inner explain-box">\
            <div class="h4-label explain-title">' + Icons.info(14) + ' ' + t.howProofScoreWorks + '</div>\
            <p class="explain-text" style="margin-bottom:6px">' + t.proofPhilosophy + '</p>\
            <p class="explain-text" style="opacity:0.7">' + proofExp + '</p>\
          </div>\
\
          <div class="card-inner explain-box">\
            <div class="h4-label explain-title">' + Icons.info(14) + ' ' + t.howStatusDecided + '</div>\
            <p class="explain-text">' + statusExp + '</p>\
          </div>\
\
          <div class="card-inner">\
            <div class="h4-label" style="margin-bottom:8px">' + t.allSources + '</div>\
            <div style="display:flex;flex-wrap:wrap;gap:4px">' + sourceListHtml + '</div>\
          </div>\
\
          <div class="modal-footer">\
            <span>' + t.updated + ': ' + coin.updated + '</span>\
          </div>\
        </div>\
      </div>\
    </div>';
}

// ── Coin Table ──
function renderCoinTable(t, isRTL) {
  var PER_PAGE = 8;
  var total = Math.ceil(COINS.length / PER_PAGE);
  var pg = window._haialPage || 1;
  var start = (pg - 1) * PER_PAGE;
  var cur = COINS.slice(start, start + PER_PAGE);
  var align = isRTL ? 'text-align:right' : 'text-align:left';

  var headers = [t.coin, t.ticker, t.haialStatus, t.sourcesStatus, t.change24h, t.trend, t.updated];

  return '\
    <div class="card full-h flex-col animate-fade-up">\
      <div class="mb-12">\
        <h2 style="font-size:17px;font-weight:700;color:var(--text-primary)">' + t.coinDatabase + '</h2>\
        <p style="font-size:11px;margin-top:4px;color:var(--text-dimmed)">\
          ' + t.clickForAnalysis + ' \u2014 ' + t.showing + ' ' + (start+1) + '-' + Math.min(start+PER_PAGE, COINS.length) + ' ' + t.of + ' ' + COINS.length + ' ' + t.coins + '\
        </p>\
      </div>\
      <div class="flex-1 overflow-auto">\
        <table class="coin-table">\
          <thead>\
            <tr>' + headers.map(function(h) { return '<th style="' + align + '">' + h + '</th>'; }).join('') + '</tr>\
          </thead>\
          <tbody>\
            ' + cur.map(function(c, i) { return '\
              <tr class="coin-row" onclick="openCoinModal(' + (start + i) + ')">\
                <td class="coin-name">' + c.name + '</td>\
                <td class="coin-ticker">' + c.ticker + '</td>\
                <td>' + renderBadge(c.category, c.emoji, t) + '</td>\
                <td>' + renderProof(c.proof) + '</td>\
                <td>' + render24hChange(c.ticker) + '</td>\
                <td>' + renderTrend(c.trend) + '</td>\
                <td class="coin-date">' + c.updated + '</td>\
              </tr>';
            }).join('') + '\
          </tbody>\
        </table>\
      </div>\
      ' + (total > 1 ? '\
        <div class="pagination">\
          <button class="page-btn" ' + (pg===1?'disabled':'') + ' onclick="changePage(' + (pg-1) + ')">\
            ' + Icons.chevLeft() + ' ' + t.previous + '\
          </button>\
          <span class="page-info">' + pg + ' / ' + total + '</span>\
          <button class="page-btn" ' + (pg===total?'disabled':'') + ' onclick="changePage(' + (pg+1) + ')">\
            ' + t.next + ' ' + Icons.chevRight() + '\
          </button>\
        </div>\
      ' : '') + '\
    </div>';
}

// ── AI Checker ──
function renderChecker(t) {
  var result = window._haialResult;
  var search = window._haialSearch || '';
  var lang = window._haialLang || 'en';

  var body;
  if (result === undefined || result === null) {
    body = '\
      <div class="checker-placeholder" style="flex:1">\
        <div>\
          <div style="opacity:0.2;margin-bottom:12px">' + Icons.search(48) + '</div>\
          <p style="font-size:13px">' + t.enterCoin + '</p>\
        </div>\
      </div>';
  } else if (result === 'nf') {
    body = '\
      <div class="info-box">\
        <div class="info-title">' + Icons.info(18) + ' ' + t.coinNotFound + '</div>\
        <p style="font-size:13px;color:var(--text-secondary)">' + t.uploadDocs + '</p>\
        <button class="try-btn try-btn-info" onclick="resetChecker()">' + t.tryAnother + '</button>\
      </div>';
  } else {
    var reasoning = locStr(result.reasoning, lang);
    body = '\
      <div class="flex-col gap-12">\
        <div class="text-center" style="padding:12px 0">\
          <div style="font-size:40px;margin-bottom:4px">' + result.emoji + '</div>\
          <h3 style="font-size:18px;font-weight:700;color:var(--text-primary)">' + result.name + '</h3>\
          <p style="font-size:11px;margin-top:4px;color:var(--text-muted)">' + t.category + ': ' + (t[result.category.toLowerCase()] || result.category) + '</p>\
        </div>\
        <div class="reason-box">\
          <div style="font-weight:600;margin-bottom:4px;font-size:12px;color:var(--text-accent)">' + t.reasoning + '</div>\
          <p style="font-size:11px;line-height:1.5;color:var(--text-secondary)">' + reasoning + '</p>\
        </div>\
        <div class="flex justify-between" style="font-size:12px;color:var(--text-muted)">\
          <span>' + t.sourcesStatusLabel + ':</span> ' + renderProof(result.proof) + '\
        </div>\
        <button class="try-btn try-btn-default" onclick="resetChecker()">' + t.tryAnother + '</button>\
      </div>';
  }

  return '\
    <div class="card full-h flex-col animate-fade-up stagger-2">\
      <h2 style="font-size:17px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px;color:var(--text-primary)">\
        <span style="color:#10b981">' + Icons.shield(18) + '</span> ' + t.aiChecker + '\
      </h2>\
      <div class="checker-input">\
        <input type="text" class="checker-field" placeholder="' + t.enterCoin + '" value="' + search + '" oninput="window._haialSearch=this.value" onkeydown="if(event.key===\'Enter\')doCheck()">\
        <button class="checker-btn" onclick="doCheck()">' + Icons.search(16) + '</button>\
      </div>\
      <div class="flex-1 overflow-auto">' + body + '</div>\
    </div>';
}

function renderHomePage(t, isRTL) {
  return '\
    <div class="grid-home">\
      <div>' + renderCoinTable(t, isRTL) + '</div>\
      <div>' + renderChecker(t) + '</div>\
    </div>';
}
