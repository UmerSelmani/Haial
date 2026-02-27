/* ═══════════════════════════════════════
   HAIAL v9.4 — Home Page (Table + 3-Tier Checker)
   ═══════════════════════════════════════ */

function renderBadge(category, emoji, t) {
  var cls = 'badge badge-' + category.toLowerCase();
  var label = t[category.toLowerCase()] || category;
  return '<span class="' + cls + '">' + emoji + ' ' + label + '</span>';
}

function renderProof(p, category) {
  var suffix = '';
  if (p.stars > 0 && (category === 'Halal')) {
    suffix = ' <span class="proof-stars">(' + '\u2605'.repeat(p.stars) + ')</span>';
  } else if (category === 'Haram') {
    suffix = ' <span style="opacity:0.7">\u274C</span>';
  } else if (category === 'Review') {
    suffix = ' <span style="opacity:0.7">\u26A0\uFE0F</span>';
  } else if (category === 'Preliminary') {
    suffix = ' <span style="opacity:0.7">\uD83D\uDD0D</span>';
  }
  var txt = p.score === 0 ? '0' : String(p.score);
  var cls = p.score === 100 && p.stars >= 1 ? 'proof-maxstar' : p.score === 100 ? 'proof-max' : p.score >= 85 ? 'proof-high' : p.score >= 70 ? 'proof-mid' : 'proof-low';
  return '<span class="proof ' + cls + '">' + txt + suffix + '</span>';
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

// ── Coin Modal (Tier 1 coins) ──
function renderModal(coin, t, onClose) {
  if (!coin) return '';
  var lang = window._haialLang || 'en';
  var reasoning = locStr(coin.reasoning, lang);
  var bizModel = locStr(coin.businessModel, lang);
  var tokenomics = locStr(coin.tokenomics, lang);
  var proofExp = locStr(coin.proofExplanation, lang);
  var statusExp = locStr(coin.statusExplanation, lang);

  var fatwaRows = coin.fatwas.map(function(fw) {
    var opLabel = t[fw.opinion] || fw.opinion;
    var calcTag = fw.inCalc ? '' : ' <span class="source-no-calc">' + t.notInCalc + '</span>';
    return '<div class="fatwa-item">' + renderFatwaIcon(fw.opinion) +
      '<strong>' + fw.fullName + '</strong>' + calcTag +
      ' <span class="fatwa-opinion fatwa-op-' + fw.opinion + '">(' + opLabel + ')</span> — ' + fw.note +
      '</div>';
  }).join('');

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
            <div class="modal-proof">' + t.sourcesStatusLabel + ': ' + renderProof(coin.proof, coin.category) + '</div>\
          </div>\
          <div class="reason-box">\
            <div class="reason-title">' + Icons.shield(16) + ' ' + t.reasoning + '</div>\
            <div class="reason-text">' + reasoning + '</div>\
          </div>\
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
          <div class="card-inner">\
            <div class="h4-label" style="margin-bottom:10px">' + t.fatwaReferences + '</div>\
            ' + fatwaRows + '\
          </div>\
          <div class="card-inner explain-box">\
            <div class="h4-label explain-title">' + Icons.info(14) + ' ' + t.howProofScoreWorks + '</div>\
            <p class="explain-text" style="margin-bottom:6px">' + t.proofPhilosophy + '</p>\
            <p class="explain-text" style="opacity:0.7">' + proofExp + '</p>\
          </div>\
          <div class="card-inner explain-box">\
            <div class="h4-label explain-title">' + Icons.info(14) + ' ' + t.howStatusDecided + '</div>\
            <p class="explain-text">' + statusExp + '</p>\
          </div>\
          <div class="card-inner">\
            <div class="h4-label" style="margin-bottom:8px">' + t.allSources + '</div>\
            <div style="display:flex;flex-wrap:wrap;gap:4px">' + sourceListHtml + '</div>\
          </div>\
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
                <td>' + renderProof(c.proof, c.category) + '</td>\
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

// ═══════════════════════════════════════
// 3-TIER AI CHECKER — Rendering
// ═══════════════════════════════════════

// ── Verdict badge for AI/Extended results ──
function verdictEmoji(v) {
  if (v === 'halal') return '\u2705';
  if (v === 'haram') return '\u274C';
  if (v === 'caution') return '\u26A0\uFE0F';
  return '\uD83D\uDD0D';
}

function verdictClass(v) {
  if (v === 'halal') return 'ai-verdict-halal';
  if (v === 'haram') return 'ai-verdict-haram';
  if (v === 'caution') return 'ai-verdict-caution';
  return 'ai-verdict-review';
}

// ── Screening row for AI results ──
function screeningIcon(status) {
  if (status === 'pass') return '<span class="scr-icon scr-pass">\u2713</span>';
  if (status === 'fail') return '<span class="scr-icon scr-fail">\u2717</span>';
  if (status === 'caution') return '<span class="scr-icon scr-caution">!</span>';
  return '<span class="scr-icon scr-na">\u2014</span>';
}

function prohibitionDot(val) {
  if (val === 'present') return '<span class="proh-dot proh-present" title="Present">\u25CF</span>';
  if (val === 'concern') return '<span class="proh-dot proh-concern" title="Concern">\u25CF</span>';
  if (val === 'none') return '<span class="proh-dot proh-none" title="None">\u25CB</span>';
  return '<span class="proh-dot proh-na">\u2014</span>';
}

function renderScreeningRow(name, label, data) {
  if (!data) return '';
  return '\
    <div class="scr-row">\
      <div class="scr-header">\
        ' + screeningIcon(data.status) + '\
        <span class="scr-label">' + label + '</span>\
        <div class="scr-prohibitions">\
          <span class="proh-tag" title="Riba">R' + prohibitionDot(data.riba) + '</span>\
          <span class="proh-tag" title="Gharar">G' + prohibitionDot(data.gharar) + '</span>\
          <span class="proh-tag" title="Maysir">M' + prohibitionDot(data.maysir) + '</span>\
        </div>\
      </div>\
      <div class="scr-note">' + (data.note || '') + '</div>\
    </div>';
}

// ── Render Tier 2 (Extended) result ──
function renderExtendedResult(coin, t) {
  var emoji = verdictEmoji(coin.verdict);
  var vcls = verdictClass(coin.verdict);
  var label = t[coin.verdict] || coin.verdict;

  return '\
    <div class="flex-col gap-12">\
      <div class="text-center" style="padding:12px 0">\
        <div style="font-size:40px;margin-bottom:4px">' + emoji + '</div>\
        <h3 style="font-size:18px;font-weight:700;color:var(--text-primary)">' + coin.name + '</h3>\
        <span class="ai-verdict ' + vcls + '">' + label + '</span>\
      </div>\
      <div class="ai-tier-badge ai-tier-ext">' + Icons.shield(12) + ' ' + t.sourceVerified + '</div>\
      <div class="reason-box">\
        <div style="font-weight:600;margin-bottom:4px;font-size:12px;color:var(--text-accent)">' + t.sourceNote + '</div>\
        <p style="font-size:12px;line-height:1.6;color:var(--text-secondary)">' + coin.note + '</p>\
      </div>\
      <div style="font-size:11px;color:var(--text-muted)">\
        ' + t.reviewedBy + ': <strong>' + coin.source + '</strong>\
      </div>\
      <button class="try-btn try-btn-default" onclick="resetChecker()">' + t.tryAnother + '</button>\
    </div>';
}

// ── Render Tier 3 (AI) result ──
function renderAiResult(ai, t) {
  var emoji = verdictEmoji(ai.verdict);
  var vcls = verdictClass(ai.verdict);
  var label = t[ai.verdict] || ai.verdict;
  var confLabel = ai.confidence === 'high' ? t.highConf : ai.confidence === 'medium' ? t.medConf : t.lowConf;

  // Screening rows
  var screenings = ai.screenings || {};
  var scrHtml =
    renderScreeningRow('legitimacy', t.scrLegitimacy, screenings.legitimacy) +
    renderScreeningRow('project',    t.scrProject,    screenings.project) +
    renderScreeningRow('financial',  t.scrFinancial,  screenings.financial) +
    renderScreeningRow('token',      t.scrToken,      screenings.token) +
    renderScreeningRow('staking',    t.scrStaking,    screenings.staking) +
    renderScreeningRow('defi',       t.scrDefi,       screenings.defi);

  // Concerns & positives
  var concerns = (ai.concerns || []).filter(function(c) { return c; });
  var positives = (ai.positives || []).filter(function(p) { return p; });
  var concernsHtml = concerns.length > 0
    ? '<div class="ai-list ai-concerns"><div class="ai-list-title">\u26A0 ' + t.concerns + '</div>' +
      concerns.map(function(c) { return '<div class="ai-list-item">' + c + '</div>'; }).join('') + '</div>'
    : '';
  var positivesHtml = positives.length > 0
    ? '<div class="ai-list ai-positives"><div class="ai-list-title">\u2705 ' + t.positives + '</div>' +
      positives.map(function(p) { return '<div class="ai-list-item">' + p + '</div>'; }).join('') + '</div>'
    : '';

  // Haram flag
  var haramFlag = ai.haram_industry_flag
    ? '<div class="ai-haram-flag">\u274C ' + t.haramIndustry + ': ' + (ai.haram_industries || []).join(', ') + '</div>'
    : '';

  // Scholar references
  var scholarHtml = ai.scholar_references
    ? '<div class="ai-scholar"><strong>' + t.scholarRef + ':</strong> ' + ai.scholar_references + '</div>'
    : '';

  // Whitepaper section
  var wpSection = '';
  if (!ai._hasWhitepaper) {
    wpSection = '\
      <div class="ai-wp-section">\
        <div class="ai-wp-title">' + Icons.shield(12) + ' ' + t.deeperAnalysis + '</div>\
        <p style="font-size:11px;color:var(--text-muted);margin-bottom:8px">' + t.pasteWhitepaper + '</p>\
        <textarea id="haial-wp-input" class="ai-wp-textarea" placeholder="' + t.wpPlaceholder + '" rows="3"></textarea>\
        <button class="try-btn try-btn-info" onclick="doAiWhitepaper()" style="margin-top:8px">' + t.analyzeWp + '</button>\
      </div>';
  } else {
    wpSection = '<div class="ai-wp-done">' + Icons.check(14) + ' ' + t.wpAnalyzed + '</div>';
  }

  return '\
    <div class="flex-col gap-10">\
      <div class="text-center" style="padding:8px 0">\
        <div style="font-size:36px;margin-bottom:4px">' + emoji + '</div>\
        <h3 style="font-size:16px;font-weight:700;color:var(--text-primary)">' + (ai.coin || '') + '</h3>\
        <div style="margin-top:6px">\
          <span class="ai-verdict ' + vcls + '">' + label + '</span>\
          <span class="ai-confidence">' + confLabel + '</span>\
        </div>\
      </div>\
      <div class="ai-tier-badge ai-tier-ai">' + Icons.shield(12) + ' ' + t.aiAnalysis + '</div>\
      <div class="ai-summary">' + (ai.summary || '') + '</div>\
      <div class="scr-grid">\
        <div class="scr-grid-header">\
          <span>' + t.screening + '</span>\
          <span class="scr-proh-header">R / G / M</span>\
        </div>\
        ' + scrHtml + '\
      </div>\
      ' + haramFlag + '\
      ' + positivesHtml + '\
      ' + concernsHtml + '\
      ' + scholarHtml + '\
      <div class="ai-disclaimer">' + (ai.disclaimer || t.aiDisclaimer) + '</div>\
      ' + wpSection + '\
      <div class="ai-remaining">' + t.checksRemaining + ': ' + (window._haialAiRemaining !== null ? window._haialAiRemaining : '?') + '/3</div>\
      <button class="try-btn try-btn-default" onclick="resetChecker()">' + t.tryAnother + '</button>\
    </div>';
}

// ═══════════════════════════════════════
// MAIN CHECKER RENDERER
// ═══════════════════════════════════════

function renderChecker(t) {
  var result = window._haialResult;
  var tier = window._haialResultTier;
  var search = window._haialSearch || '';
  var loading = window._haialLoading;
  var lang = window._haialLang || 'en';

  var body;

  // ── Loading state ──
  if (loading) {
    body = '\
      <div class="checker-placeholder" style="flex:1">\
        <div class="text-center">\
          <div class="ai-spinner"></div>\
          <p style="font-size:13px;margin-top:12px;color:var(--text-muted)">' + t.aiAnalyzing + '</p>\
          <p style="font-size:11px;margin-top:4px;color:var(--text-dimmed)">' + t.aiWait + '</p>\
        </div>\
      </div>';
  }
  // ── Empty state ──
  else if (result === undefined || result === null) {
    var remaining = window._haialAiRemaining;
    var remainingHtml = remaining !== null ? '<p style="font-size:10px;margin-top:8px;color:var(--text-dimmed)">' + t.checksRemaining + ': ' + remaining + '/3</p>' : '';
    body = '\
      <div class="checker-placeholder" style="flex:1">\
        <div>\
          <div style="opacity:0.2;margin-bottom:12px">' + Icons.search(48) + '</div>\
          <p style="font-size:13px">' + t.enterCoin + '</p>\
          <p style="font-size:10px;margin-top:6px;color:var(--text-dimmed)">' + t.tierExplain + '</p>\
          ' + remainingHtml + '\
        </div>\
      </div>';
  }
  // ── Rate limited ──
  else if (result === 'rate_limited') {
    body = '\
      <div class="info-box">\
        <div class="info-title">\u23F0 ' + t.rateLimited + '</div>\
        <p style="font-size:12px;color:var(--text-secondary)">' + t.rateLimitedMsg + '</p>\
        <button class="try-btn try-btn-info" onclick="resetChecker()">' + t.tryAnother + '</button>\
      </div>';
  }
  // ── Error / Offline ──
  else if (result === 'error' || result === 'offline') {
    body = '\
      <div class="info-box">\
        <div class="info-title">' + Icons.info(18) + ' ' + (result === 'offline' ? t.aiOffline : t.aiError) + '</div>\
        <p style="font-size:12px;color:var(--text-secondary)">' + t.aiErrorMsg + '</p>\
        <button class="try-btn try-btn-info" onclick="resetChecker()">' + t.tryAnother + '</button>\
      </div>';
  }
  // ── Tier 1: Database result ──
  else if (tier === 'db') {
    var reasoning = locStr(result.reasoning, lang);
    body = '\
      <div class="flex-col gap-12">\
        <div class="text-center" style="padding:12px 0">\
          <div style="font-size:40px;margin-bottom:4px">' + result.emoji + '</div>\
          <h3 style="font-size:18px;font-weight:700;color:var(--text-primary)">' + result.name + '</h3>\
          <p style="font-size:11px;margin-top:4px;color:var(--text-muted)">' + t.category + ': ' + (t[result.category.toLowerCase()] || result.category) + '</p>\
        </div>\
        <div class="ai-tier-badge ai-tier-db">' + Icons.shield(12) + ' ' + t.inDatabase + '</div>\
        <div class="reason-box">\
          <div style="font-weight:600;margin-bottom:4px;font-size:12px;color:var(--text-accent)">' + t.reasoning + '</div>\
          <p style="font-size:11px;line-height:1.5;color:var(--text-secondary)">' + reasoning + '</p>\
        </div>\
        <div class="flex justify-between" style="font-size:12px;color:var(--text-muted)">\
          <span>' + t.sourcesStatusLabel + ':</span> ' + renderProof(result.proof, result.category) + '\
        </div>\
        <p style="font-size:10px;color:var(--text-dimmed)">' + t.clickTableDetail + '</p>\
        <button class="try-btn try-btn-default" onclick="resetChecker()">' + t.tryAnother + '</button>\
      </div>';
  }
  // ── Tier 2: Extended source database ──
  else if (tier === 'extended') {
    body = renderExtendedResult(result, t);
  }
  // ── Tier 3: AI Analysis ──
  else if (tier === 'ai') {
    body = renderAiResult(result, t);
  }
  // ── Fallback ──
  else {
    body = '\
      <div class="info-box">\
        <div class="info-title">' + Icons.info(18) + ' ' + t.coinNotFound + '</div>\
        <button class="try-btn try-btn-info" onclick="resetChecker()">' + t.tryAnother + '</button>\
      </div>';
  }

  return '\
    <div class="card full-h flex-col animate-fade-up stagger-2">\
      <h2 style="font-size:17px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px;color:var(--text-primary)">\
        <span style="color:#10b981">' + Icons.shield(18) + '</span> ' + t.aiChecker + '\
      </h2>\
      <div class="checker-input">\
        <input type="text" class="checker-field" placeholder="' + t.enterCoin + '" value="' + search + '" oninput="window._haialSearch=this.value" onkeydown="if(event.key===\'Enter\')doCheck()"' + (loading ? ' disabled' : '') + '>\
        <button class="checker-btn" onclick="doCheck()"' + (loading ? ' disabled' : '') + '>' + Icons.search(16) + '</button>\
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
