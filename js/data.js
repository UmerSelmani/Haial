/* ═══════════════════════════════════════
   HAIAL v9.2 — Coin Database + Scoring Engine
   Sources carry opinions → auto-calculates
   proof score + haial status + explanations
   ═══════════════════════════════════════ */

// ── Source Authority Registry ──
var SOURCE_AUTHORITY = {
  'IFG':       { fullName: 'Islamic Finance Guru',     weight: 30, tier: 'primary' },
  'PIF':       { fullName: 'Practical Islamic Finance', weight: 28, tier: 'primary' },
  'Amanah':    { fullName: 'Amanah Advisors',          weight: 25, tier: 'secondary' },
  'Sharlife':  { fullName: 'Sharlife',                  weight: 20, tier: 'secondary' },
  'Musaffa':   { fullName: 'Musaffa',                   weight: 18, tier: 'secondary' },
  'UKIFC':     { fullName: 'UK Islamic Finance Council', weight: 15, tier: 'secondary' },
  'Community': { fullName: 'Community Consensus',       weight: 8,  tier: 'community' },
};

var MAX_WEIGHT = Object.values(SOURCE_AUTHORITY).reduce(function(s, v) { return s + v.weight; }, 0);

// ── Scoring Algorithm ──
function calculateProofScore(reviews) {
  if (!reviews || reviews.length === 0) return { score: 0, stars: 0 };
  var rawWeight = 0;
  reviews.forEach(function(r) {
    var auth = SOURCE_AUTHORITY[r.source];
    if (auth) rawWeight += auth.weight;
  });
  var score = Math.round((rawWeight / MAX_WEIGHT) * 100);
  if (score > 100) score = 100;
  var formalCount = reviews.filter(function(r) {
    var auth = SOURCE_AUTHORITY[r.source];
    return auth && auth.tier !== 'community';
  }).length;
  var stars = 0;
  if (formalCount >= 2) stars = 1;
  if (formalCount >= 3) stars = 2;
  if (formalCount >= 4) stars = 3;
  return { score: score, stars: stars };
}

// ── Status Algorithm ──
function calculateStatus(reviews) {
  if (!reviews || reviews.length === 0) return 'Preliminary';
  if (reviews.length === 1) return 'Preliminary';
  var opinions = reviews.map(function(r) { return r.opinion; });
  var positive = opinions.filter(function(o) { return o === 'halal' || o === 'caution'; }).length;
  var negative = opinions.filter(function(o) { return o === 'haram'; }).length;
  if (opinions.includes('review')) return 'Review';
  if (positive > 0 && negative > 0) return 'Review';
  if (negative === opinions.length) return 'Haram';
  if (positive === opinions.length) return 'Halal';
  return 'Review';
}

function statusEmoji(status) {
  if (status === 'Halal') return '\u2705';
  if (status === 'Haram') return '\u274C';
  if (status === 'Review') return '\u26A0\uFE0F';
  return '\uD83D\uDD0D';
}

// ── Build explanation strings ──
function buildProofExplanation(reviews, score, stars) {
  if (!reviews || reviews.length === 0) return { en: 'No sources have reviewed this coin yet.', ar: 'لم تتم مراجعة هذه العملة بعد.', tr: 'Henüz kaynak incelemesi yok.', sq: 'Asnjë burim nuk ka shqyrtuar.', ru: 'Источники ещё не рассмотрели.' };

  var parts = reviews.map(function(r) {
    var auth = SOURCE_AUTHORITY[r.source];
    return (auth ? auth.fullName : r.source) + ' (' + auth.weight + '/' + MAX_WEIGHT + ')';
  });
  var formalCount = reviews.filter(function(r) { var a = SOURCE_AUTHORITY[r.source]; return a && a.tier !== 'community'; }).length;

  var en = 'Score ' + score + '/100 = sum of source weights. Sources: ' + parts.join(' + ') + '.';
  if (stars > 0) en += ' ' + stars + ' star' + (stars > 1 ? 's' : '') + ' = ' + formalCount + ' formal scholars agree.';
  else en += ' No stars = fewer than 2 formal scholars.';

  return {
    en: en,
    ar: 'النتيجة ' + score + '/100 = مجموع أوزان المصادر. ' + reviews.length + ' مصادر. ' + (stars > 0 ? stars + ' نجوم = ' + formalCount + ' علماء.' : 'بدون نجوم.'),
    tr: 'Puan ' + score + '/100 = kaynak ağırlıkları toplamı. ' + reviews.length + ' kaynak. ' + (stars > 0 ? stars + ' yıldız = ' + formalCount + ' resmi kaynak.' : 'Yıldız yok.'),
    sq: 'Pikët ' + score + '/100 = shuma e peshave. ' + reviews.length + ' burime. ' + (stars > 0 ? stars + ' yje = ' + formalCount + ' burime formale.' : 'Pa yje.'),
    ru: 'Оценка ' + score + '/100 = сумма весов. ' + reviews.length + ' источников. ' + (stars > 0 ? stars + ' звёзд = ' + formalCount + ' формальных.' : 'Без звёзд.'),
  };
}

function buildStatusExplanation(reviews, status) {
  var n = reviews ? reviews.length : 0;
  var explanations = {
    'Preliminary': {
      en: n === 0 ? 'No sources reviewed → Preliminary.' : 'Only ' + n + ' source → not enough for a ruling. Needs 2+ independent sources.',
      ar: n === 0 ? 'لا مصادر ← أولي.' : 'مصدر واحد فقط ← غير كافٍ. يحتاج ٢+ مصادر.',
      tr: n === 0 ? 'Kaynak yok → Ön değerlendirme.' : 'Sadece ' + n + ' kaynak → yetersiz. 2+ kaynak gerekli.',
      sq: n === 0 ? 'Pa burime → Paraprake.' : 'Vetëm ' + n + ' burim → jo mjaftueshëm.',
      ru: n === 0 ? 'Нет источников → Предварительно.' : 'Только ' + n + ' источник → недостаточно.',
    },
    'Halal': {
      en: 'All ' + n + ' sources agree: permissible (halal/caution). Consensus reached → Halal.',
      ar: 'جميع المصادر (' + n + ') متفقة: جائز. إجماع ← حلال.',
      tr: 'Tüm ' + n + ' kaynak hemfikir: caiz. Konsensüs → Helal.',
      sq: 'Të ' + n + ' burimet pajtohen: e lejuar. Konsensus → Hallall.',
      ru: 'Все ' + n + ' источников согласны: допустимо. Консенсус → Халяль.',
    },
    'Haram': {
      en: 'All ' + n + ' sources agree: not permissible. Consensus reached → Haram.',
      ar: 'جميع المصادر (' + n + ') متفقة: غير جائز. إجماع ← حرام.',
      tr: 'Tüm ' + n + ' kaynak hemfikir: caiz değil. Konsensüs → Haram.',
      sq: 'Të ' + n + ' burimet pajtohen: e ndaluar. Konsensus → Haram.',
      ru: 'Все ' + n + ' источников согласны: запрещено. Консенсус → Харам.',
    },
    'Review': {
      en: 'Sources disagree or explicit "under review" opinion present. Needs further scholarly review.',
      ar: 'المصادر غير متفقة أو رأي "قيد المراجعة". يحتاج مراجعة إضافية.',
      tr: 'Kaynaklar uyuşmuyor veya "inceleme" görüşü var. Ek inceleme gerekli.',
      sq: 'Burimet nuk pajtohen ose mendim "rishikim". Nevojitet rishikim.',
      ru: 'Источники расходятся или есть мнение "на рассмотрении".',
    },
  };
  return explanations[status] || explanations['Review'];
}

function buildFatwas(reviews) {
  return reviews.map(function(r) {
    var auth = SOURCE_AUTHORITY[r.source];
    return (auth ? auth.fullName : r.source) + ': ' + r.note;
  });
}

// ── Raw Coin Data ──
var COINS_RAW = [
  {
    name: 'Bitcoin', ticker: 'BTC', updated: '15 Jan 2026', trend: 'up',
    reasoning: { en: 'Bitcoin is permissible as a decentralized store of value and medium of exchange, similar to digital gold. No interest-based mechanisms.', ar: 'البيتكوين جائز كمخزن قيمة لامركزي ووسيلة تبادل، مشابه للذهب الرقمي. لا آليات ربوية.', tr: 'Bitcoin, merkezi olmayan bir değer deposu ve değişim aracı olarak caizdir. Faiz mekanizması yoktur.', sq: 'Bitcoin lejohet si depo vlere e decentralizuar dhe mjet këmbimi. Pa mekanizma interesi.', ru: 'Биткоин допустим как децентрализованное хранилище стоимости. Нет процентных механизмов.' },
    businessModel: { en: 'Decentralized peer-to-peer digital currency with no central authority.', ar: 'عملة رقمية لامركزية نظير لنظير بدون سلطة مركزية.', tr: 'Merkezi otoritesi olmayan eşler arası dijital para birimi.', sq: 'Monedhë digjitale pa autoritet qendror.', ru: 'Децентрализованная цифровая валюта без центрального органа.' },
    tokenomics: { en: 'Fixed supply of 21M coins, deflationary, Proof of Work.', ar: 'إمداد ثابت ٢١ مليون، انكماشي، إثبات العمل.', tr: 'Sabit 21M arz, deflasyonist, Proof of Work.', sq: 'Furnizim fiks 21M, deflacionist, Proof of Work.', ru: 'Фиксированное предложение 21М, дефляционный, Proof of Work.' },
    reviews: [
      { source: 'IFG',    opinion: 'halal', note: 'Permissible as digital gold' },
      { source: 'PIF',    opinion: 'halal', note: 'Allowed for spot trading' },
      { source: 'Amanah', opinion: 'halal', note: 'Halal for long-term holding' },
    ]
  },
  {
    name: 'Ethereum', ticker: 'ETH', updated: '15 Jan 2026', trend: 'neutral',
    reasoning: { en: 'Permissible due to smart contract utility. Post-merge eliminates most energy concerns.', ar: 'جائز بفضل العقود الذكية. بعد الدمج تم حل مشاكل الطاقة.', tr: 'Akıllı sözleşme faydası nedeniyle caiz. Birleşme sonrası enerji endişeleri giderildi.', sq: 'E lejuar për shkak të kontratave inteligjente.', ru: 'Допустим благодаря смарт-контрактам. После Merge нет проблем с энергией.' },
    businessModel: { en: 'Decentralized platform for smart contracts and dApps.', ar: 'منصة لامركزية للعقود الذكية والتطبيقات.', tr: 'Akıllı sözleşmeler için merkezi olmayan platform.', sq: 'Platformë e decentralizuar për kontrata inteligjente.', ru: 'Децентрализованная платформа для смарт-контрактов.' },
    tokenomics: { en: 'Proof of Stake, inflationary with burn mechanism (EIP-1559).', ar: 'إثبات الحصة، تضخمي مع آلية حرق.', tr: 'Proof of Stake, yakım mekanizmalı.', sq: 'Proof of Stake, me mekanizëm djegie.', ru: 'Proof of Stake, инфляционный с механизмом сжигания.' },
    reviews: [
      { source: 'IFG', opinion: 'halal',   note: 'Permissible for utility' },
      { source: 'PIF', opinion: 'caution',  note: 'Allowed with caution on DeFi lending' },
    ]
  },
  {
    name: 'Cardano', ticker: 'ADA', updated: '12 Jan 2026', trend: 'up',
    reasoning: { en: 'Highly permissible — peer-reviewed academic approach, focus on sustainability and social impact.', ar: 'جائز جداً — نهج أكاديمي محكّم، تركيز على الاستدامة والأثر الاجتماعي.', tr: 'Son derece caiz — akademik yaklaşım, sürdürülebilirlik odaklı.', sq: 'Shumë e lejuar — qasje akademike, fokus te qëndrueshmëria.', ru: 'Полностью допустим — академический подход, устойчивое развитие.' },
    businessModel: { en: 'Research-driven blockchain with focus on sustainability.', ar: 'بلوكتشين قائم على البحث مع التركيز على الاستدامة.', tr: 'Sürdürülebilirlik odaklı araştırma blockchain\'i.', sq: 'Blockchain i bazuar në kërkime.', ru: 'Блокчейн на основе исследований.' },
    tokenomics: { en: 'Proof of Stake (Ouroboros), max supply 45B ADA.', ar: 'إثبات الحصة، حد أقصى ٤٥ مليار.', tr: 'Proof of Stake, maks 45 milyar ADA.', sq: 'Proof of Stake, maks 45B ADA.', ru: 'Proof of Stake (Ouroboros), макс 45B ADA.' },
    reviews: [
      { source: 'IFG',       opinion: 'halal', note: 'Strongly permissible' },
      { source: 'PIF',       opinion: 'halal', note: 'Recommended' },
      { source: 'Amanah',    opinion: 'halal', note: 'Halal' },
      { source: 'Sharlife',  opinion: 'halal', note: 'Approved' },
      { source: 'Community', opinion: 'halal', note: 'Widely accepted' },
    ]
  },
  {
    name: 'Solana', ticker: 'SOL', updated: '10 Jan 2026', trend: 'up',
    reasoning: { en: 'Permissible as high-performance smart contract platform with real utility. Some centralization concerns.', ar: 'جائز كمنصة عقود ذكية عالية الأداء. بعض مخاوف المركزية.', tr: 'Yüksek performanslı platform olarak caiz. Merkezi yapı endişeleri mevcut.', sq: 'E lejuar si platformë me performancë të lartë. Disa shqetësime centralizimi.', ru: 'Допустим как высокопроизводительная платформа. Есть опасения о централизации.' },
    businessModel: { en: 'High-throughput blockchain for dApps and DeFi.', ar: 'بلوكتشين عالي الإنتاجية للتطبيقات اللامركزية.', tr: 'Yüksek verimli dApp blockchain\'i.', sq: 'Blockchain me xhiro të lartë për dApps.', ru: 'Высокопроизводительный блокчейн для dApps.' },
    tokenomics: { en: 'Proof of History + PoS. Inflationary with decreasing rate.', ar: 'إثبات التاريخ + إثبات الحصة. تضخمي بمعدل متناقص.', tr: 'PoH + PoS. Azalan enflasyonist.', sq: 'PoH + PoS. Inflacionist me normë zvogëluese.', ru: 'PoH + PoS. Инфляционный с убывающей ставкой.' },
    reviews: [
      { source: 'IFG',       opinion: 'caution', note: 'Permissible with caution on centralization' },
      { source: 'Community', opinion: 'halal',    note: 'Generally accepted' },
    ]
  },
  {
    name: 'XRP', ticker: 'XRP', updated: '08 Jan 2026', trend: 'neutral',
    reasoning: { en: 'Under review — centralized nature of Ripple Labs and ongoing legal proceedings. Cross-border utility is legitimate.', ar: 'قيد المراجعة — الطبيعة المركزية لشركة ريبل والإجراءات القانونية المستمرة.', tr: 'İnceleme altında — Ripple\'ın merkeziyetçi yapısı ve devam eden davalar.', sq: 'Nën rishikim — natyra e centralizuar e Ripple Labs.', ru: 'На рассмотрении — централизованная природа Ripple Labs.' },
    businessModel: { en: 'Cross-border payment settlement network.', ar: 'شبكة تسوية مدفوعات عابرة للحدود.', tr: 'Sınır ötesi ödeme ağı.', sq: 'Rrjet pagesash ndërkufitare.', ru: 'Сеть трансграничных платежей.' },
    tokenomics: { en: 'Pre-mined with scheduled escrow releases.', ar: 'مستخرج مسبقاً مع إصدارات مجدولة.', tr: 'Önceden üretilmiş, planlı emanet serbest bırakma.', sq: 'Para-minuar me lëshime të planifikuara.', ru: 'Премайненный со запланированным эскроу.' },
    reviews: [
      { source: 'PIF',       opinion: 'review', note: 'Under review — centralization concerns' },
      { source: 'Community', opinion: 'caution', note: 'Mixed opinions, utility recognized' },
    ]
  },
  {
    name: 'Chainlink', ticker: 'LINK', updated: '05 Jan 2026', trend: 'up',
    reasoning: { en: 'Permissible as oracle network providing essential blockchain infrastructure. Clear utility beyond speculation.', ar: 'جائز كشبكة أوراكل توفر بنية تحتية أساسية. منفعة واضحة.', tr: 'Oracle ağı olarak caiz. Spekülasyonun ötesinde net fayda.', sq: 'E lejuar si rrjet oracle me infrastrukturë esenciale.', ru: 'Допустим как оракул-сеть с реальной инфраструктурной функцией.' },
    businessModel: { en: 'Decentralized oracle network for smart contracts.', ar: 'شبكة أوراكل لامركزية للعقود الذكية.', tr: 'Akıllı sözleşmeler için merkezi olmayan oracle ağı.', sq: 'Rrjet oracle i decentralizuar.', ru: 'Децентрализованная оракул-сеть для смарт-контрактов.' },
    tokenomics: { en: 'Fixed supply of 1B LINK. Used for staking and payments.', ar: 'إمداد ثابت ١ مليار. للتخزين والمدفوعات.', tr: 'Sabit 1 milyar arz. Staking ve ödemeler için.', sq: 'Furnizim fiks 1B. Për staking dhe pagesa.', ru: 'Фиксированное предложение 1B. Стейкинг и платежи.' },
    reviews: [
      { source: 'IFG',    opinion: 'halal', note: 'Permissible — clear utility' },
      { source: 'Amanah', opinion: 'halal', note: 'Approved' },
    ]
  },
  {
    name: 'Dogecoin', ticker: 'DOGE', updated: '15 Jan 2026', trend: 'down',
    reasoning: { en: 'Not permissible — originated as meme with no real utility. Heavily speculative, resembles gambling (maisir).', ar: 'غير جائز — نشأ كميم بدون منفعة حقيقية. مضاربة شديدة تشبه القمار.', tr: 'Caiz değil — faydasız meme coin. Yoğun spekülasyon, kumar benzeri.', sq: 'E ndaluar — meme pa dobi reale. Spekulim i rëndë, ngjason me bixhozin.', ru: 'Не допустим — мем без реальной пользы. Спекулятивный, напоминает азартные игры.' },
    businessModel: { en: 'Meme-based cryptocurrency with no utility.', ar: 'عملة رقمية قائمة على الميم بدون منفعة.', tr: 'Faydası olmayan meme tabanlı kripto para.', sq: 'Kriptomonedhë meme pa dobi.', ru: 'Мем-криптовалюта без функционала.' },
    tokenomics: { en: 'Unlimited inflationary supply.', ar: 'إمداد تضخمي غير محدود.', tr: 'Sınırsız enflasyonist arz.', sq: 'Furnizim inflacionist i pakufizuar.', ru: 'Неограниченная инфляционная эмиссия.' },
    reviews: [
      { source: 'IFG',       opinion: 'haram', note: 'Speculative gambling, no utility' },
      { source: 'PIF',       opinion: 'haram', note: 'Not permissible — maisir' },
      { source: 'Community', opinion: 'haram', note: 'Consensus: pure speculation' },
    ]
  },
  {
    name: 'Shiba Inu', ticker: 'SHIB', updated: '15 Jan 2026', trend: 'down',
    reasoning: { en: 'Not permissible. Pure meme token — no utility, trading driven entirely by speculation and hype.', ar: 'غير جائز. رمز ميم بحت — لا منفعة، تداول بالمضاربة والضجة فقط.', tr: 'Caiz değil. Saf meme — fayda yok, tamamen spekülasyonla işlem görüyor.', sq: 'E ndaluar. Token meme i pastër — pa dobi, vetëm spekulim.', ru: 'Не допустим. Чистый мем-токен — нет пользы, чистая спекуляция.' },
    businessModel: { en: 'Meme token with no inherent utility.', ar: 'رمز ميم بدون منفعة ذاتية.', tr: 'Doğal faydası olmayan meme token.', sq: 'Token meme pa dobi të brendshme.', ru: 'Мем-токен без функционала.' },
    tokenomics: { en: 'Quadrillion initial supply. Marketing-driven burns.', ar: 'إمداد أولي بالكوادريليون. حرق تسويقي.', tr: 'Katrilyon başlangıç arzı. Pazarlama amaçlı yakım.', sq: 'Furnizim fillestar kuadrilion. Djegie marketingu.', ru: 'Квадриллион начальная эмиссия. Маркетинговое сжигание.' },
    reviews: [
      { source: 'IFG',       opinion: 'haram', note: 'No utility, speculative' },
      { source: 'PIF',       opinion: 'haram', note: 'Pure speculation' },
      { source: 'Community', opinion: 'haram', note: 'Consensus: gambling' },
    ]
  },
  {
    name: 'Polygon', ticker: 'POL', updated: '03 Jan 2026', trend: 'neutral',
    reasoning: { en: 'Permissible as Layer-2 scaling solution for Ethereum. Genuine utility reducing costs and improving accessibility.', ar: 'جائز كحل توسع الطبقة الثانية لإيثيريوم. منفعة حقيقية.', tr: 'Ethereum için L2 çözümü olarak caiz. Maliyet düşürme faydası.', sq: 'E lejuar si zgjidhje shkallëzimi Layer-2 për Ethereum.', ru: 'Допустим как L2 решение для Ethereum. Реальная польза.' },
    businessModel: { en: 'Layer-2 scaling solution for Ethereum ecosystem.', ar: 'حل توسع الطبقة الثانية لمنظومة إيثيريوم.', tr: 'Ethereum ekosistemi için L2 ölçeklendirme çözümü.', sq: 'Zgjidhje shkallëzimi Layer-2 për Ethereum.', ru: 'L2 масштабирование для экосистемы Ethereum.' },
    tokenomics: { en: 'Fixed supply. Used for staking, governance, gas fees.', ar: 'إمداد ثابت. للتخزين والحوكمة ورسوم الغاز.', tr: 'Sabit arz. Staking, yönetişim ve gaz ücretleri.', sq: 'Furnizim fiks. Staking, qeverisje, tarifa gazi.', ru: 'Фиксированное предложение. Стейкинг, управление, газ.' },
    reviews: [
      { source: 'IFG', opinion: 'halal', note: 'Permissible' },
      { source: 'PIF', opinion: 'halal', note: 'Allowed' },
    ]
  },
  {
    name: 'Avalanche', ticker: 'AVAX', updated: '01 Jan 2026', trend: 'up',
    reasoning: { en: 'Preliminary assessment. Smart contract platform with genuine utility — requires further scholarly review on DeFi mechanisms.', ar: 'تقييم أولي. منصة عقود ذكية بمنفعة حقيقية — تحتاج مراجعة علمية إضافية.', tr: 'Ön değerlendirme. Gerçek faydası olan platform — daha fazla inceleme gerekli.', sq: 'Vlerësim paraprak. Platformë me dobi — nevojitet rishikim i mëtejshëm.', ru: 'Предварительная оценка. Платформа с реальной пользой — требует дальнейшего рассмотрения.' },
    businessModel: { en: 'Decentralized platform with subnet architecture.', ar: 'منصة لامركزية بهندسة الشبكات الفرعية.', tr: 'Alt ağ mimarisi ile merkezi olmayan platform.', sq: 'Platformë e decentralizuar me arkitekturë subnet.', ru: 'Децентрализованная платформа с архитектурой подсетей.' },
    tokenomics: { en: 'Capped 720M AVAX. PoS with burn mechanism.', ar: 'حد أقصى ٧٢٠ مليون. إثبات الحصة مع حرق.', tr: 'Maks 720M AVAX. PoS + yakım mekanizması.', sq: 'Maks 720M AVAX. PoS me djegie.', ru: 'Макс 720М AVAX. PoS с механизмом сжигания.' },
    reviews: [
      { source: 'Community', opinion: 'halal', note: 'Likely permissible — awaiting formal review' },
    ]
  },
];

// ── 24H Price Change (Binance) ──
var _priceCache = {};

async function fetch24hChange(ticker) {
  if (_priceCache[ticker] && Date.now() - _priceCache[ticker].ts < 60000) return _priceCache[ticker].data;
  var symbol = ticker === 'POL' ? 'POLUSDT' : ticker + 'USDT';
  try {
    var resp = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=' + symbol);
    if (!resp.ok) throw new Error(resp.status);
    var d = await resp.json();
    var result = { price: parseFloat(d.lastPrice), change: parseFloat(d.priceChangePercent) };
    _priceCache[ticker] = { ts: Date.now(), data: result };
    return result;
  } catch (e) { return null; }
}

// ── Process coins ──
var COINS = COINS_RAW.map(function(raw) {
  var proof = calculateProofScore(raw.reviews);
  var category = calculateStatus(raw.reviews);
  var emoji = statusEmoji(category);
  var sources = raw.reviews.map(function(r) { return r.source; });
  var fatwas = buildFatwas(raw.reviews);
  var proofExplanation = buildProofExplanation(raw.reviews, proof.score, proof.stars);
  var statusExplanation = buildStatusExplanation(raw.reviews, category);

  return {
    name: raw.name, ticker: raw.ticker,
    category: category, sources: sources,
    proof: proof, emoji: emoji,
    updated: raw.updated, trend: raw.trend,
    reasoning: raw.reasoning,
    businessModel: raw.businessModel,
    tokenomics: raw.tokenomics,
    fatwas: fatwas,
    reviews: raw.reviews,
    proofExplanation: proofExplanation,
    statusExplanation: statusExplanation,
  };
});

// Helper to get localized string
function locStr(obj, lang) {
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj['en'] || '';
}

if (typeof console !== 'undefined') {
  console.log('Haial v9.2 Scoring Engine:');
  COINS.forEach(function(c) {
    console.log('  ' + c.emoji + ' ' + c.ticker.padEnd(5) + '→ ' + c.category.padEnd(12) +
      'Proof: ' + c.proof.score + (c.proof.stars > 0 ? ' ' + '\u2605'.repeat(c.proof.stars) : ''));
  });
}
