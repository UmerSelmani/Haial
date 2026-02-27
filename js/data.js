/* ═══════════════════════════════════════
   HAIAL v9.4 — Coin Database + Scoring Engine
   Per-coin scoring: only reviewers count
   ═══════════════════════════════════════ */

// ── Source Authority Registry ──
var SOURCE_AUTHORITY = {
  'IFG':       { fullName: 'Islamic Finance Guru',      weight: 30, tier: 'primary',   inCalc: true },
  'PIF':       { fullName: 'Practical Islamic Finance',  weight: 30, tier: 'primary',   inCalc: true },
  'Amanah':    { fullName: 'Amanah Advisors',           weight: 25, tier: 'secondary', inCalc: true },
  'Sharlife':  { fullName: 'Sharlife',                   weight: 20, tier: 'secondary', inCalc: true },
  'Community': { fullName: 'Community Consensus',        weight: 10, tier: 'community', inCalc: true },
  'Musaffa':   { fullName: 'Musaffa',                    weight: 0,  tier: 'secondary', inCalc: false },
  'UKIFC':     { fullName: 'UK Islamic Finance Council', weight: 0,  tier: 'secondary', inCalc: false },
};

// All source keys for display
var ALL_SOURCE_KEYS = Object.keys(SOURCE_AUTHORITY);
var TOTAL_MAX = ALL_SOURCE_KEYS.reduce(function(s, k) { return s + SOURCE_AUTHORITY[k].weight; }, 0); // 115

// ── V5 Directional Scoring + Consensus Multiplier ──
// Base: (positiveWeight − negativeWeight) / TOTAL_MAX × 100
// Consensus bonus: ★+3, ★★+5, ★★★+7 (halal coins only)
function calculateProofScore(reviews) {
  if (!reviews || reviews.length === 0) return { score: 0, stars: 0, coinMax: 0 };
  var positiveW = 0, negativeW = 0, totalW = 0;
  reviews.forEach(function(r) {
    var auth = SOURCE_AUTHORITY[r.source];
    if (!auth) return;
    totalW += auth.weight;
    if (r.opinion === 'halal' || r.opinion === 'caution') positiveW += auth.weight;
    else if (r.opinion === 'haram') negativeW += auth.weight;
  });
  var raw = Math.round(((positiveW - negativeW) / TOTAL_MAX) * 100);
  var score = Math.max(0, Math.min(100, raw));

  // Stars: only for positive-direction coins (halal/caution majority)
  var formalCount = reviews.filter(function(r) {
    var auth = SOURCE_AUTHORITY[r.source];
    return auth && auth.weight > 0 && auth.tier !== 'community';
  }).length;
  var isPositive = positiveW > negativeW;
  var stars = 0;
  if (isPositive) {
    if (formalCount >= 2) stars = 1;
    if (formalCount >= 3) stars = 2;
    if (formalCount >= 4) stars = 3;
  }

  // Consensus bonus (only when stars earned)
  var bonus = [0, 3, 5, 7][stars] || 0;
  score = Math.min(100, score + bonus);

  return { score: score, stars: stars, coinMax: totalW };
}

// ── Status Algorithm ──
function calculateStatus(reviews) {
  if (!reviews || reviews.length === 0) return 'Preliminary';
  var calcReviews = reviews.filter(function(r) { var a = SOURCE_AUTHORITY[r.source]; return a && a.weight > 0; });
  if (calcReviews.length <= 1) return 'Preliminary';
  var opinions = calcReviews.map(function(r) { return r.opinion; });
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

// ── Explanation builders (all 5 langs, same detail) ──
function buildProofExplanation(reviews, score, stars, coinMax) {
  if (!reviews || reviews.length === 0) return {
    en: 'No sources have reviewed this coin yet. Score: 0/100.',
    ar: 'لم تقم أي جهة بمراجعة هذه العملة بعد. النتيجة: 0/100.',
    tr: 'Henüz hiçbir kaynak bu coini incelemedi. Puan: 0/100.',
    sq: 'Asnjë burim nuk e ka shqyrtuar këtë monedhë ende. Pikët: 0/100.',
    ru: 'Ни один источник ещё не рассмотрел эту монету. Оценка: 0/100.',
  };

  var calcReviews = reviews.filter(function(r) { var a = SOURCE_AUTHORITY[r.source]; return a && a.weight > 0; });
  var formalCount = calcReviews.filter(function(r) { var a = SOURCE_AUTHORITY[r.source]; return a && a.tier !== 'community'; }).length;

  var parts = calcReviews.map(function(r) {
    var auth = SOURCE_AUTHORITY[r.source];
    var sign = (r.opinion === 'halal' || r.opinion === 'caution') ? '+' + auth.weight : (r.opinion === 'haram' ? '-' + auth.weight : '0');
    return auth.fullName + ' (' + r.opinion + ' ' + sign + ')';
  });
  var posW = calcReviews.reduce(function(s,r) { var a = SOURCE_AUTHORITY[r.source]; return s + ((r.opinion === 'halal' || r.opinion === 'caution') ? a.weight : 0); }, 0);
  var negW = calcReviews.reduce(function(s,r) { var a = SOURCE_AUTHORITY[r.source]; return s + (r.opinion === 'haram' ? a.weight : 0); }, 0);
  var net = posW - negW;

  var starExplEn = stars > 0
    ? stars + ' star' + (stars > 1 ? 's' : '') + ' = ' + formalCount + ' formal scholarly sources reviewed.'
    : 'No stars yet \u2014 fewer than 2 formal scholarly sources have reviewed.';
  var starExplAr = stars > 0
    ? stars + ' \u2605 = ' + formalCount + ' \u0645\u0635\u0627\u062F\u0631 \u0639\u0644\u0645\u064A\u0629 \u0631\u0633\u0645\u064A\u0629 \u0642\u0627\u0645\u062A \u0628\u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629.'
    : '\u0628\u062F\u0648\u0646 \u0646\u062C\u0648\u0645 \u2014 \u0623\u0642\u0644 \u0645\u0646 \u0645\u0635\u062F\u0631\u064A\u0646 \u0639\u0644\u0645\u064A\u064A\u0646 \u0631\u0633\u0645\u064A\u064A\u0646 \u0642\u0627\u0645\u0648\u0627 \u0628\u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629.';
  var starExplTr = stars > 0
    ? stars + ' y\u0131ld\u0131z = ' + formalCount + ' resmi akademik kaynak inceledi.'
    : 'Y\u0131ld\u0131z yok \u2014 2\'den az resmi akademik kaynak inceledi.';
  var starExplSq = stars > 0
    ? stars + ' yje = ' + formalCount + ' burime formale akademike shqyrtuan.'
    : 'Pa yje \u2014 m\u00EB pak se 2 burime formale akademike kan\u00EB shqyrtuar.';
  var starExplRu = stars > 0
    ? stars + ' \u2605 = ' + formalCount + ' \u0444\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0445 \u043D\u0430\u0443\u0447\u043D\u044B\u0445 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u043E\u0432 \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u043B\u0438.'
    : '\u0411\u0435\u0437 \u0437\u0432\u0451\u0437\u0434 \u2014 \u043C\u0435\u043D\u0435\u0435 2 \u0444\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0445 \u043D\u0430\u0443\u0447\u043D\u044B\u0445 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u043E\u0432 \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u043B\u0438.';

  return {
    en: 'Score ' + score + '/100 = (halal weight ' + posW + ' \u2212 haram weight ' + negW + ') / ' + TOTAL_MAX + ' = net ' + net + '. Sources: ' + parts.join(', ') + '. ' + starExplEn,
    ar: '\u0627\u0644\u0646\u062A\u064A\u062C\u0629 ' + score + '/100 = (\u0648\u0632\u0646 \u0627\u0644\u062D\u0644\u0627\u0644 ' + posW + ' \u2212 \u0648\u0632\u0646 \u0627\u0644\u062D\u0631\u0627\u0645 ' + negW + ') / ' + TOTAL_MAX + ' = \u0635\u0627\u0641\u064A ' + net + '. \u0627\u0644\u0645\u0635\u0627\u062F\u0631: ' + parts.join('\u060C ') + '. ' + starExplAr,
    tr: 'Puan ' + score + '/100 = (helal a\u011F\u0131rl\u0131k ' + posW + ' \u2212 haram a\u011F\u0131rl\u0131k ' + negW + ') / ' + TOTAL_MAX + ' = net ' + net + '. Kaynaklar: ' + parts.join(', ') + '. ' + starExplTr,
    sq: 'Pik\u00EBt ' + score + '/100 = (pesha hallall ' + posW + ' \u2212 pesha haram ' + negW + ') / ' + TOTAL_MAX + ' = neto ' + net + '. Burimet: ' + parts.join(', ') + '. ' + starExplSq,
    ru: '\u041E\u0446\u0435\u043D\u043A\u0430 ' + score + '/100 = (\u0432\u0435\u0441 \u0445\u0430\u043B\u044F\u043B ' + posW + ' \u2212 \u0432\u0435\u0441 \u0445\u0430\u0440\u0430\u043C ' + negW + ') / ' + TOTAL_MAX + ' = \u043D\u0435\u0442\u0442\u043E ' + net + '. \u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438: ' + parts.join(', ') + '. ' + starExplRu,
  };
}

function buildStatusExplanation(reviews, status) {
  var calcReviews = reviews ? reviews.filter(function(r) { var a = SOURCE_AUTHORITY[r.source]; return a && a.weight > 0; }) : [];
  var n = calcReviews.length;
  var explanations = {
    'Preliminary': {
      en: n === 0 ? 'No sources have reviewed this coin yet → Status: Preliminary. Needs at least 2 independent sources for a ruling.' : 'Only ' + n + ' source has reviewed → not enough for a definitive ruling. Needs 2+ independent sources to determine halal/haram status.',
      ar: n === 0 ? 'لم تقم أي جهة بمراجعة هذه العملة بعد ← الحالة: أولي. يحتاج على الأقل مصدرين مستقلين لإصدار حكم.' : 'مصدر واحد فقط قام بالمراجعة ← غير كافٍ لحكم نهائي. يحتاج ٢+ مصادر مستقلة لتحديد حالة الحلال/الحرام.',
      tr: n === 0 ? 'Henüz hiçbir kaynak bu coini incelemedi → Durum: Ön Değerlendirme. Kesin karar için en az 2 bağımsız kaynak gerekli.' : 'Sadece ' + n + ' kaynak inceledi → kesin karar için yetersiz. Helal/haram durumu belirlemek için 2+ bağımsız kaynak gerekli.',
      sq: n === 0 ? 'Asnjë burim nuk e ka shqyrtuar ende → Statusi: Paraprake. Nevojiten të paktën 2 burime të pavarura për vendim.' : 'Vetëm ' + n + ' burim ka shqyrtuar → jo mjaftueshëm për vendim përfundimtar. Nevojiten 2+ burime të pavarura.',
      ru: n === 0 ? 'Ни один источник ещё не рассмотрел → Статус: Предварительно. Нужно минимум 2 независимых источника для вынесения решения.' : 'Только ' + n + ' источник рассмотрел → недостаточно для окончательного решения. Нужно 2+ независимых источника.',
    },
    'Halal': {
      en: 'All ' + n + ' reviewing sources agree: this coin is permissible (halal or caution). Scholarly consensus reached → Status: Halal.',
      ar: 'جميع المصادر المراجعة (' + n + ') متفقة: هذه العملة جائزة (حلال أو بحذر). تم التوصل إلى إجماع علمي ← الحالة: حلال.',
      tr: 'İnceleme yapan tüm ' + n + ' kaynak hemfikir: bu coin caiz (helal veya dikkatli). Akademik konsensüs sağlandı → Durum: Helal.',
      sq: 'Të ' + n + ' burimet shqyrtuese pajtohen: kjo monedhë është e lejuar (hallall ose me kujdes). Konsensusi akademik u arrit → Statusi: Hallall.',
      ru: 'Все ' + n + ' рассматривающих источников согласны: эта монета допустима (халяль или с осторожностью). Научный консенсус достигнут → Статус: Халяль.',
    },
    'Haram': {
      en: 'All ' + n + ' reviewing sources agree: this coin is not permissible. Scholarly consensus reached → Status: Haram.',
      ar: 'جميع المصادر المراجعة (' + n + ') متفقة: هذه العملة غير جائزة. تم التوصل إلى إجماع علمي ← الحالة: حرام.',
      tr: 'İnceleme yapan tüm ' + n + ' kaynak hemfikir: bu coin caiz değil. Akademik konsensüs sağlandı → Durum: Haram.',
      sq: 'Të ' + n + ' burimet shqyrtuese pajtohen: kjo monedhë nuk është e lejuar. Konsensusi akademik u arrit → Statusi: Haram.',
      ru: 'Все ' + n + ' рассматривающих источников согласны: эта монета не допустима. Научный консенсус достигнут → Статус: Харам.',
    },
    'Review': {
      en: 'Sources disagree or an explicit "under review" opinion is present. Mixed or inconclusive rulings → Status: Review. Needs further scholarly analysis.',
      ar: 'المصادر غير متفقة أو يوجد رأي صريح بـ "قيد المراجعة". أحكام مختلطة أو غير حاسمة ← الحالة: مراجعة. يحتاج تحليلاً علمياً إضافياً.',
      tr: 'Kaynaklar uyuşmuyor veya açık bir "inceleme altında" görüşü mevcut. Karışık veya belirsiz kararlar → Durum: İnceleme. Ek akademik analiz gerekli.',
      sq: 'Burimet nuk pajtohen ose ka mendim eksplicit "nën rishikim". Vendime të përziera ose jo përfundimtare → Statusi: Rishikim. Nevojitet analizë akademike shtesë.',
      ru: 'Источники расходятся или присутствует явное мнение "на рассмотрении". Смешанные или неокончательные решения → Статус: Рассмотрение. Нужен дополнительный научный анализ.',
    },
  };
  return explanations[status] || explanations['Review'];
}

function buildFatwas(reviews) {
  return reviews.map(function(r) {
    var auth = SOURCE_AUTHORITY[r.source];
    return { source: r.source, fullName: auth ? auth.fullName : r.source, opinion: r.opinion, note: r.note, inCalc: auth ? auth.weight > 0 : false };
  });
}

// ── Raw Coin Data (all descriptions in 5 languages, SAME detail) ──
var COINS_RAW = [
  {
    name: 'Bitcoin', ticker: 'BTC', updated: '15 Jan 2026', trend: 'up',
    reasoning: {
      en: 'Bitcoin is permissible as a decentralized store of value and medium of exchange, similar to digital gold. No interest-based mechanisms are involved. Proof of Work mining is considered legitimate effort.',
      ar: 'البيتكوين جائز كمخزن قيمة لامركزي ووسيلة تبادل، مشابه للذهب الرقمي. لا توجد آليات قائمة على الفائدة. يعتبر تعدين إثبات العمل جهداً مشروعاً.',
      tr: 'Bitcoin, merkezi olmayan bir değer deposu ve değişim aracı olarak caizdir, dijital altına benzer. Faiz temelli hiçbir mekanizma içermez. İş İspatı madenciliği meşru çaba olarak kabul edilir.',
      sq: 'Bitcoin lejohet si depo vlere e decentralizuar dhe mjet këmbimi, i ngjashëm me arin digjital. Nuk ka mekanizma të bazuara në interes. Minimi Proof of Work konsiderohet përpjekje legjitime.',
      ru: 'Биткоин допустим как децентрализованное хранилище стоимости и средство обмена, аналогично цифровому золоту. Не содержит процентных механизмов. Майнинг Proof of Work считается законным усилием.',
    },
    businessModel: {
      en: 'Decentralized peer-to-peer digital currency with no central authority. Operates on a transparent blockchain ledger.',
      ar: 'عملة رقمية لامركزية من نظير إلى نظير بدون سلطة مركزية. تعمل على دفتر حسابات بلوكتشين شفاف.',
      tr: 'Merkezi otoritesi olmayan eşler arası merkezi olmayan dijital para birimi. Şeffaf bir blockchain defterinde çalışır.',
      sq: 'Monedhë digjitale e decentralizuar ndërmjet palëve pa autoritet qendror. Funksionon mbi një regjistër blockchain transparent.',
      ru: 'Децентрализованная одноранговая цифровая валюта без центрального органа. Работает на прозрачном блокчейн-реестре.',
    },
    tokenomics: {
      en: 'Fixed supply of 21 million coins, deflationary by design. Proof of Work consensus. Block reward halves every ~4 years.',
      ar: 'إمداد ثابت ٢١ مليون عملة، انكماشي بالتصميم. إجماع إثبات العمل. مكافأة الكتلة تنخفض للنصف كل ~٤ سنوات.',
      tr: 'Sabit 21 milyon coin arzı, tasarım gereği deflasyonist. İş İspatı konsensüsü. Blok ödülü her ~4 yılda yarılanır.',
      sq: 'Furnizim fiks 21 milion monedha, deflacionist sipas dizajnit. Konsensus Proof of Work. Shpërblimi i bllokut përgjysmohet çdo ~4 vjet.',
      ru: 'Фиксированное предложение 21 миллион монет, дефляционный по дизайну. Консенсус Proof of Work. Награда за блок уменьшается вдвое каждые ~4 года.',
    },
    reviews: [
      { source: 'IFG',    opinion: 'halal', note: 'Permissible as digital gold' },
      { source: 'PIF',    opinion: 'halal', note: 'Allowed for spot trading' },
      { source: 'Amanah', opinion: 'halal', note: 'Halal for long-term holding' },
    ]
  },
  {
    name: 'Ethereum', ticker: 'ETH', updated: '15 Jan 2026', trend: 'neutral',
    reasoning: {
      en: 'Permissible due to smart contract utility and decentralized application platform. Post-merge transition to Proof of Stake eliminated energy waste concerns. Caution advised around DeFi lending protocols.',
      ar: 'جائز بفضل منفعة العقود الذكية ومنصة التطبيقات اللامركزية. انتقال ما بعد الدمج إلى إثبات الحصة أزال مخاوف هدر الطاقة. ينصح بالحذر من بروتوكولات إقراض التمويل اللامركزي.',
      tr: 'Akıllı sözleşme faydası ve merkezi olmayan uygulama platformu nedeniyle caizdir. Birleşme sonrası Hisse İspatına geçiş enerji israfı endişelerini giderdi. DeFi borç verme protokollerinde dikkatli olunması önerilir.',
      sq: 'E lejuar për shkak të dobisë së kontratave inteligjente dhe platformës së aplikacioneve të decentralizuara. Tranzicioni pas bashkimit në Proof of Stake eliminoi shqetësimet e humbjes së energjisë. Kujdes rekomandohet rreth protokolleve të huadhënies DeFi.',
      ru: 'Допустим благодаря функциональности смарт-контрактов и платформе децентрализованных приложений. Переход на Proof of Stake после слияния устранил проблемы энергозатрат. Рекомендуется осторожность с протоколами DeFi-кредитования.',
    },
    businessModel: {
      en: 'Decentralized platform for smart contracts and dApps. Hosts thousands of tokens and DeFi protocols.',
      ar: 'منصة لامركزية للعقود الذكية والتطبيقات اللامركزية. تستضيف آلاف الرموز وبروتوكولات التمويل اللامركزي.',
      tr: 'Akıllı sözleşmeler ve dApp\'ler için merkezi olmayan platform. Binlerce token ve DeFi protokolünü barındırır.',
      sq: 'Platformë e decentralizuar për kontrata inteligjente dhe dApps. Strehon mijëra tokenë dhe protokolle DeFi.',
      ru: 'Децентрализованная платформа для смарт-контрактов и dApps. Размещает тысячи токенов и протоколов DeFi.',
    },
    tokenomics: {
      en: 'Proof of Stake consensus. Inflationary with EIP-1559 burn mechanism that can make it deflationary during high usage.',
      ar: 'إجماع إثبات الحصة. تضخمي مع آلية حرق EIP-1559 التي يمكن أن تجعله انكماشياً أثناء الاستخدام العالي.',
      tr: 'Hisse İspatı konsensüsü. EIP-1559 yakım mekanizmalı enflasyonist, yoğun kullanımda deflasyonist olabilir.',
      sq: 'Konsensus Proof of Stake. Inflacionist me mekanizmin e djegies EIP-1559 që mund ta bëjë deflacionist gjatë përdorimit të lartë.',
      ru: 'Консенсус Proof of Stake. Инфляционный с механизмом сжигания EIP-1559, который может сделать его дефляционным при высокой нагрузке.',
    },
    reviews: [
      { source: 'IFG', opinion: 'halal',  note: 'Permissible for utility' },
      { source: 'PIF', opinion: 'caution', note: 'Allowed with caution on DeFi lending' },
    ]
  },
  {
    name: 'Cardano', ticker: 'ADA', updated: '12 Jan 2026', trend: 'up',
    reasoning: {
      en: 'Highly permissible — peer-reviewed academic approach with focus on sustainability, scalability, and social impact in developing nations. One of the most thoroughly reviewed coins.',
      ar: 'جائز جداً — نهج أكاديمي محكّم مع التركيز على الاستدامة والقابلية للتوسع والأثر الاجتماعي في الدول النامية. من أكثر العملات مراجعة شاملة.',
      tr: 'Son derece caiz — sürdürülebilirlik, ölçeklenebilirlik ve gelişmekte olan ülkelerdeki sosyal etki odaklı hakemli akademik yaklaşım. En kapsamlı incelenen coinlerden biri.',
      sq: 'Shumë e lejuar — qasje akademike e rishikuar me fokus te qëndrueshmëria, shkallëzueshmëria dhe ndikimi social në vendet në zhvillim. Një nga monedhat më të shqyrtuara plotësisht.',
      ru: 'Полностью допустим — рецензируемый академический подход с фокусом на устойчивости, масштабируемости и социальном влиянии в развивающихся странах. Одна из наиболее тщательно рассмотренных монет.',
    },
    businessModel: {
      en: 'Research-driven blockchain platform with focus on sustainability and formal verification methods.',
      ar: 'منصة بلوكتشين قائمة على البحث مع التركيز على الاستدامة وطرق التحقق الرسمية.',
      tr: 'Sürdürülebilirlik ve resmi doğrulama yöntemlerine odaklanan araştırma odaklı blockchain platformu.',
      sq: 'Platformë blockchain e drejtuar nga kërkimi me fokus te qëndrueshmëria dhe metodat e verifikimit formal.',
      ru: 'Исследовательская блокчейн-платформа с фокусом на устойчивости и методах формальной верификации.',
    },
    tokenomics: {
      en: 'Proof of Stake (Ouroboros protocol). Maximum supply 45 billion ADA. Staking rewards without lending.',
      ar: 'إثبات الحصة (بروتوكول أوروبوروس). الحد الأقصى للإمداد ٤٥ مليار ADA. مكافآت التخزين بدون إقراض.',
      tr: 'Hisse İspatı (Ouroboros protokolü). Maksimum arz 45 milyar ADA. Borç verme olmadan staking ödülleri.',
      sq: 'Proof of Stake (protokolli Ouroboros). Furnizim maksimal 45 miliardë ADA. Shpërblime staking pa huadhënie.',
      ru: 'Proof of Stake (протокол Ouroboros). Максимальное предложение 45 миллиардов ADA. Награды за стейкинг без кредитования.',
    },
    reviews: [
      { source: 'IFG',       opinion: 'halal', note: 'Strongly permissible' },
      { source: 'PIF',       opinion: 'halal', note: 'Recommended' },
      { source: 'Amanah',    opinion: 'halal', note: 'Halal — strong utility' },
      { source: 'Sharlife',  opinion: 'halal', note: 'Approved' },
      { source: 'Community', opinion: 'halal', note: 'Widely accepted as halal' },
    ]
  },
  {
    name: 'Solana', ticker: 'SOL', updated: '10 Jan 2026', trend: 'up',
    reasoning: {
      en: 'Permissible as high-performance smart contract platform with real utility. Some centralization concerns due to validator requirements and network outages. Caution advised.',
      ar: 'جائز كمنصة عقود ذكية عالية الأداء بمنفعة حقيقية. بعض مخاوف المركزية بسبب متطلبات المدققين وانقطاعات الشبكة. ينصح بالحذر.',
      tr: 'Gerçek faydası olan yüksek performanslı akıllı sözleşme platformu olarak caiz. Doğrulayıcı gereksinimleri ve ağ kesintileri nedeniyle merkeziyet endişeleri mevcut. Dikkat önerilir.',
      sq: 'E lejuar si platformë kontratash inteligjente me performancë të lartë me dobi reale. Disa shqetësime centralizimi për shkak të kërkesave të validuesve dhe ndërprerjeve të rrjetit. Rekomandohet kujdes.',
      ru: 'Допустим как высокопроизводительная платформа смарт-контрактов с реальной пользой. Есть опасения о централизации из-за требований к валидаторам и сбоев сети. Рекомендуется осторожность.',
    },
    businessModel: {
      en: 'High-throughput blockchain for decentralized applications and DeFi. Processes thousands of transactions per second.',
      ar: 'بلوكتشين عالي الإنتاجية للتطبيقات اللامركزية والتمويل اللامركزي. يعالج آلاف المعاملات في الثانية.',
      tr: 'Merkezi olmayan uygulamalar ve DeFi için yüksek verimli blockchain. Saniyede binlerce işlem gerçekleştirir.',
      sq: 'Blockchain me xhiro të lartë për aplikacione të decentralizuara dhe DeFi. Përpunon mijëra transaksione në sekondë.',
      ru: 'Высокопроизводительный блокчейн для децентрализованных приложений и DeFi. Обрабатывает тысячи транзакций в секунду.',
    },
    tokenomics: {
      en: 'Proof of History + Proof of Stake consensus. Inflationary with decreasing rate, starting at 8% and reducing to 1.5% long-term.',
      ar: 'إجماع إثبات التاريخ + إثبات الحصة. تضخمي بمعدل متناقص، يبدأ من ٨٪ وينخفض إلى ١.٥٪ على المدى الطويل.',
      tr: 'Tarih İspatı + Hisse İspatı konsensüsü. Azalan oranlı enflasyonist, %8\'den başlayıp uzun vadede %1.5\'e düşer.',
      sq: 'Konsensus Proof of History + Proof of Stake. Inflacionist me normë zvogëluese, duke filluar nga 8% dhe duke u ulur në 1.5% afatgjatë.',
      ru: 'Консенсус Proof of History + Proof of Stake. Инфляционный с убывающей ставкой, начиная с 8% и снижаясь до 1.5% в долгосрочной перспективе.',
    },
    reviews: [
      { source: 'IFG',       opinion: 'caution', note: 'Permissible with caution on centralization' },
      { source: 'Community', opinion: 'halal',    note: 'Generally accepted as permissible' },
    ]
  },
  {
    name: 'XRP', ticker: 'XRP', updated: '08 Jan 2026', trend: 'neutral',
    reasoning: {
      en: 'Under review — centralized nature of Ripple Labs and pre-mined supply raise concerns. Cross-border payment utility is legitimate, but corporate control and ongoing legal proceedings need resolution.',
      ar: 'قيد المراجعة — الطبيعة المركزية لشركة ريبل لابز والإمداد المستخرج مسبقاً تثير مخاوف. منفعة الدفع عبر الحدود مشروعة، لكن السيطرة المؤسسية والإجراءات القانونية الجارية تحتاج حلاً.',
      tr: 'İnceleme altında — Ripple Labs\'ın merkeziyetçi yapısı ve önceden üretilmiş arz endişe yaratıyor. Sınır ötesi ödeme faydası meşru, ancak kurumsal kontrol ve devam eden hukuki süreçler çözüme kavuşmalı.',
      sq: 'Nën rishikim — natyra e centralizuar e Ripple Labs dhe furnizimi i para-minuar ngrenë shqetësime. Dobia e pagesave ndërkufitare është legjitime, por kontrolli korporativ dhe procedurat ligjore në vazhdim kanë nevojë për zgjidhje.',
      ru: 'На рассмотрении — централизованная природа Ripple Labs и предварительно добытое предложение вызывают опасения. Полезность трансграничных платежей легитимна, но корпоративный контроль и текущие судебные процессы требуют разрешения.',
    },
    businessModel: {
      en: 'Cross-border payment settlement network designed for financial institutions. Partners with banks globally.',
      ar: 'شبكة تسوية مدفوعات عابرة للحدود مصممة للمؤسسات المالية. شراكات مع البنوك عالمياً.',
      tr: 'Finansal kurumlar için tasarlanmış sınır ötesi ödeme ağı. Küresel olarak bankalarla ortaklık yapar.',
      sq: 'Rrjet pagesash ndërkufitare i dizajnuar për institucione financiare. Partneritete me banka globalisht.',
      ru: 'Сеть трансграничных платежных расчётов для финансовых учреждений. Партнёрство с банками по всему миру.',
    },
    tokenomics: {
      en: 'Pre-mined with 100 billion total supply. Scheduled escrow releases by Ripple Labs. No mining or staking.',
      ar: 'مستخرج مسبقاً بإمداد إجمالي ١٠٠ مليار. إصدارات ضمان مجدولة من ريبل لابز. لا تعدين ولا تخزين.',
      tr: 'Toplam 100 milyar arzla önceden üretilmiş. Ripple Labs tarafından planlı emanet serbest bırakmaları. Madencilik veya staking yok.',
      sq: 'Para-minuar me furnizim total 100 miliardë. Lëshime garancie të planifikuara nga Ripple Labs. Pa mining ose staking.',
      ru: 'Премайненный с общим предложением 100 миллиардов. Запланированные эскроу-выпуски Ripple Labs. Нет майнинга или стейкинга.',
    },
    reviews: [
      { source: 'PIF',       opinion: 'review',  note: 'Under review — centralization concerns' },
      { source: 'Community', opinion: 'caution',  note: 'Mixed opinions, utility recognized' },
    ]
  },
  {
    name: 'Chainlink', ticker: 'LINK', updated: '05 Jan 2026', trend: 'up',
    reasoning: {
      en: 'Permissible as oracle network providing essential blockchain infrastructure. Bridges real-world data to smart contracts. Clear utility beyond speculation.',
      ar: 'جائز كشبكة أوراكل توفر بنية تحتية أساسية للبلوكتشين. تربط بيانات العالم الحقيقي بالعقود الذكية. منفعة واضحة تتجاوز المضاربة.',
      tr: 'Temel blockchain altyapısı sağlayan oracle ağı olarak caiz. Gerçek dünya verilerini akıllı sözleşmelere bağlar. Spekülasyonun ötesinde net fayda.',
      sq: 'E lejuar si rrjet oracle që ofron infrastrukturë esenciale blockchain. Lidh të dhënat e botës reale me kontratat inteligjente. Dobi e qartë përtej spekulimit.',
      ru: 'Допустим как оракул-сеть, обеспечивающая критически важную блокчейн-инфраструктуру. Связывает данные реального мира со смарт-контрактами. Явная полезность помимо спекуляций.',
    },
    businessModel: {
      en: 'Decentralized oracle network connecting smart contracts to real-world data, APIs, and payment systems.',
      ar: 'شبكة أوراكل لامركزية تربط العقود الذكية ببيانات العالم الحقيقي وواجهات البرمجة وأنظمة الدفع.',
      tr: 'Akıllı sözleşmeleri gerçek dünya verileri, API\'ler ve ödeme sistemlerine bağlayan merkezi olmayan oracle ağı.',
      sq: 'Rrjet oracle i decentralizuar që lidh kontratat inteligjente me të dhënat e botës reale, API-të dhe sistemet e pagesave.',
      ru: 'Децентрализованная оракул-сеть, соединяющая смарт-контракты с реальными данными, API и платёжными системами.',
    },
    tokenomics: {
      en: 'Fixed supply of 1 billion LINK tokens. Used for staking by node operators and payments for data services.',
      ar: 'إمداد ثابت ١ مليار رمز LINK. يستخدم للتخزين من قبل مشغلي العقد والمدفوعات لخدمات البيانات.',
      tr: 'Sabit 1 milyar LINK token arzı. Düğüm operatörleri tarafından staking ve veri hizmetleri ödemeleri için kullanılır.',
      sq: 'Furnizim fiks 1 miliardë tokenë LINK. Përdoret për staking nga operatorët e nyjeve dhe pagesa për shërbime të dhënash.',
      ru: 'Фиксированное предложение 1 миллиард токенов LINK. Используется для стейкинга операторами узлов и оплаты услуг данных.',
    },
    reviews: [
      { source: 'IFG',    opinion: 'halal', note: 'Permissible — clear utility' },
      { source: 'Amanah', opinion: 'halal', note: 'Approved as infrastructure' },
    ]
  },
  {
    name: 'Dogecoin', ticker: 'DOGE', updated: '15 Jan 2026', trend: 'down',
    reasoning: {
      en: 'Not permissible — originated as a joke/meme with no real utility or development roadmap. Trading is driven entirely by speculation and social media hype, resembling gambling (maisir).',
      ar: 'غير جائز — نشأ كنكتة/ميم بدون منفعة حقيقية أو خارطة طريق للتطوير. التداول مدفوع بالكامل بالمضاربة والضجة على وسائل التواصل، يشبه القمار (الميسر).',
      tr: 'Caiz değil — gerçek bir fayda veya geliştirme yol haritası olmadan şaka/meme olarak başladı. Ticaret tamamen spekülasyon ve sosyal medya abartısıyla yönlendiriliyor, kumara (maisir) benzer.',
      sq: 'E ndaluar — filloi si shaka/meme pa dobi reale ose rrugë zhvillimi. Tregtia drejtohet tërësisht nga spekulimi dhe buja në media sociale, duke ngjasuar me bixhozin (maisir).',
      ru: 'Не допустим — создан как шутка/мем без реальной пользы или плана развития. Торговля полностью обусловлена спекуляцией и хайпом в соцсетях, напоминает азартные игры (майсир).',
    },
    businessModel: {
      en: 'Meme-based cryptocurrency with no utility, no development team roadmap, and no real use case.',
      ar: 'عملة رقمية قائمة على الميم بدون منفعة، بدون خارطة طريق لفريق التطوير، وبدون حالة استخدام حقيقية.',
      tr: 'Faydası, geliştirme ekibi yol haritası ve gerçek kullanım durumu olmayan meme tabanlı kripto para.',
      sq: 'Kriptomonedhë e bazuar në meme pa dobi, pa rrugë zhvillimi ekipi, dhe pa rast përdorimi real.',
      ru: 'Мем-криптовалюта без функционала, без дорожной карты команды разработки и без реального варианта использования.',
    },
    tokenomics: {
      en: 'Unlimited inflationary supply — 5 billion new DOGE minted annually. No supply cap, no burn mechanism.',
      ar: 'إمداد تضخمي غير محدود — ٥ مليارات DOGE جديدة يتم سكها سنوياً. لا حد أقصى للإمداد، لا آلية حرق.',
      tr: 'Sınırsız enflasyonist arz — yıllık 5 milyar yeni DOGE basılıyor. Arz tavanı yok, yakım mekanizması yok.',
      sq: 'Furnizim inflacionist i pakufizuar — 5 miliardë DOGE të reja prodhohen çdo vit. Pa kufi furnizimi, pa mekanizëm djegie.',
      ru: 'Неограниченная инфляционная эмиссия — 5 миллиардов новых DOGE ежегодно. Нет лимита предложения, нет механизма сжигания.',
    },
    reviews: [
      { source: 'IFG',       opinion: 'haram', note: 'Speculative gambling, no utility' },
      { source: 'PIF',       opinion: 'haram', note: 'Not permissible — maisir' },
      { source: 'Community', opinion: 'haram', note: 'Consensus: pure speculation' },
    ]
  },
  {
    name: 'Shiba Inu', ticker: 'SHIB', updated: '15 Jan 2026', trend: 'down',
    reasoning: {
      en: 'Not permissible. Pure meme token — no utility, trading driven entirely by speculation, social media hype, and celebrity endorsements. Resembles gambling (maisir).',
      ar: 'غير جائز. رمز ميم بحت — لا منفعة، التداول مدفوع بالكامل بالمضاربة والضجة على وسائل التواصل وتأييد المشاهير. يشبه القمار (الميسر).',
      tr: 'Caiz değil. Saf meme token — fayda yok, ticaret tamamen spekülasyon, sosyal medya abartısı ve ünlü onaylarıyla yönlendiriliyor. Kumara (maisir) benzer.',
      sq: 'E ndaluar. Token meme i pastër — pa dobi, tregtia drejtohet tërësisht nga spekulimi, buja në media sociale dhe mbështetjet e famshëm. Ngjason me bixhozin (maisir).',
      ru: 'Не допустим. Чистый мем-токен — нет пользы, торговля полностью обусловлена спекуляцией, хайпом в соцсетях и поддержкой знаменитостей. Напоминает азартные игры (майсир).',
    },
    businessModel: {
      en: 'Meme token ecosystem with no inherent utility. "Shibarium" L2 launched but adoption remains minimal.',
      ar: 'نظام بيئي لرمز ميم بدون منفعة ذاتية. تم إطلاق "شيباريوم" L2 لكن التبني لا يزال ضئيلاً.',
      tr: 'Doğal faydası olmayan meme token ekosistemi. "Shibarium" L2 başlatıldı ancak benimseme minimal kaldı.',
      sq: 'Ekosistem token meme pa dobi të brendshme. "Shibarium" L2 u lançua por adoptimi mbetet minimal.',
      ru: 'Экосистема мем-токена без врождённой полезности. "Shibarium" L2 запущен, но принятие остаётся минимальным.',
    },
    tokenomics: {
      en: 'Initial supply of 1 quadrillion tokens. Marketing-driven burns. No fundamental supply constraint.',
      ar: 'إمداد أولي كوادريليون رمز. حرق مدفوع بالتسويق. لا قيود أساسية على الإمداد.',
      tr: 'Başlangıç arzı 1 katrilyon token. Pazarlama odaklı yakımlar. Temel arz kısıtlaması yok.',
      sq: 'Furnizim fillestar 1 kuadrilion tokenë. Djegie të drejtuara nga marketingu. Pa kufizim themelor furnizimi.',
      ru: 'Начальное предложение 1 квадриллион токенов. Маркетинговое сжигание. Нет фундаментального ограничения предложения.',
    },
    reviews: [
      { source: 'IFG',       opinion: 'haram', note: 'No utility, speculative' },
      { source: 'PIF',       opinion: 'haram', note: 'Pure speculation, not permissible' },
      { source: 'Community', opinion: 'haram', note: 'Consensus: gambling' },
    ]
  },
  {
    name: 'Polygon', ticker: 'POL', updated: '03 Jan 2026', trend: 'neutral',
    reasoning: {
      en: 'Permissible as Layer-2 scaling solution for Ethereum. Genuine utility in reducing transaction costs and improving blockchain accessibility for everyday users.',
      ar: 'جائز كحل توسع الطبقة الثانية لإيثيريوم. منفعة حقيقية في تقليل تكاليف المعاملات وتحسين إمكانية الوصول للبلوكتشين للمستخدمين العاديين.',
      tr: 'Ethereum için Katman-2 ölçeklendirme çözümü olarak caiz. İşlem maliyetlerini düşürme ve günlük kullanıcılar için blockchain erişilebilirliğini artırmada gerçek fayda.',
      sq: 'E lejuar si zgjidhje shkallëzimi Layer-2 për Ethereum. Dobi e vërtetë në reduktimin e kostove të transaksioneve dhe përmirësimin e aksesueshmërisë blockchain për përdoruesit e përditshëm.',
      ru: 'Допустим как решение масштабирования Layer-2 для Ethereum. Реальная польза в снижении стоимости транзакций и улучшении доступности блокчейна для обычных пользователей.',
    },
    businessModel: {
      en: 'Layer-2 scaling solution for Ethereum ecosystem. Provides cheaper and faster transactions while inheriting Ethereum security.',
      ar: 'حل توسع الطبقة الثانية لمنظومة إيثيريوم. يوفر معاملات أرخص وأسرع مع وراثة أمان إيثيريوم.',
      tr: 'Ethereum ekosistemi için Katman-2 ölçeklendirme çözümü. Ethereum güvenliğini koruyarak daha ucuz ve hızlı işlemler sağlar.',
      sq: 'Zgjidhje shkallëzimi Layer-2 për ekosistemin Ethereum. Ofron transaksione më të lira dhe më të shpejta ndërsa trashëgon sigurinë e Ethereum.',
      ru: 'Решение масштабирования Layer-2 для экосистемы Ethereum. Обеспечивает более дешёвые и быстрые транзакции с наследованием безопасности Ethereum.',
    },
    tokenomics: {
      en: 'Fixed supply. POL token used for staking, governance voting, and gas fees on Polygon network.',
      ar: 'إمداد ثابت. رمز POL يستخدم للتخزين والتصويت على الحوكمة ورسوم الغاز على شبكة Polygon.',
      tr: 'Sabit arz. POL tokeni Polygon ağında staking, yönetişim oylaması ve gaz ücretleri için kullanılır.',
      sq: 'Furnizim fiks. Tokeni POL përdoret për staking, votim qeverisje dhe tarifa gazi në rrjetin Polygon.',
      ru: 'Фиксированное предложение. Токен POL используется для стейкинга, голосования по управлению и оплаты газа в сети Polygon.',
    },
    reviews: [
      { source: 'IFG', opinion: 'halal', note: 'Permissible — genuine scaling utility' },
      { source: 'PIF', opinion: 'halal', note: 'Allowed — real infrastructure value' },
    ]
  },
  {
    name: 'Avalanche', ticker: 'AVAX', updated: '01 Jan 2026', trend: 'up',
    reasoning: {
      en: 'Preliminary assessment. Smart contract platform with genuine utility and innovative subnet architecture. Requires further formal scholarly review on DeFi mechanisms and staking model.',
      ar: 'تقييم أولي. منصة عقود ذكية بمنفعة حقيقية وهندسة شبكات فرعية مبتكرة. تحتاج مراجعة علمية رسمية إضافية حول آليات التمويل اللامركزي ونموذج التخزين.',
      tr: 'Ön değerlendirme. Gerçek faydası ve yenilikçi alt ağ mimarisi olan akıllı sözleşme platformu. DeFi mekanizmaları ve staking modeli hakkında ek resmi akademik inceleme gerekli.',
      sq: 'Vlerësim paraprak. Platformë kontratash inteligjente me dobi reale dhe arkitekturë inovative subnet. Kërkon rishikim formal akademik shtesë mbi mekanizmat DeFi dhe modelin e staking.',
      ru: 'Предварительная оценка. Платформа смарт-контрактов с реальной пользой и инновационной архитектурой подсетей. Требуется дополнительное формальное научное рассмотрение механизмов DeFi и модели стейкинга.',
    },
    businessModel: {
      en: 'Decentralized platform with customizable subnet architecture. Enables creating purpose-built blockchains.',
      ar: 'منصة لامركزية بهندسة شبكات فرعية قابلة للتخصيص. تمكن من إنشاء بلوكتشين مخصصة لأغراض محددة.',
      tr: 'Özelleştirilebilir alt ağ mimarisi ile merkezi olmayan platform. Amaca yönelik blockchain oluşturmayı sağlar.',
      sq: 'Platformë e decentralizuar me arkitekturë subnet të personalizueshme. Mundëson krijimin e blockchain-eve të ndërtuara për qëllime specifike.',
      ru: 'Децентрализованная платформа с настраиваемой архитектурой подсетей. Позволяет создавать целевые блокчейны.',
    },
    tokenomics: {
      en: 'Capped at 720 million AVAX. Proof of Stake with burn mechanism. Transaction fees are burned permanently.',
      ar: 'حد أقصى ٧٢٠ مليون AVAX. إثبات الحصة مع آلية حرق. رسوم المعاملات تُحرق نهائياً.',
      tr: 'Maksimum 720 milyon AVAX. Yakım mekanizmalı Hisse İspatı. İşlem ücretleri kalıcı olarak yakılır.',
      sq: 'Kufizuar në 720 milionë AVAX. Proof of Stake me mekanizëm djegie. Tarifat e transaksioneve digjen përgjithmonë.',
      ru: 'Ограничено 720 миллионами AVAX. Proof of Stake с механизмом сжигания. Комиссии за транзакции сжигаются навсегда.',
    },
    reviews: [
      { source: 'Community', opinion: 'halal', note: 'Likely permissible — awaiting formal scholarly review' },
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
  var proofExplanation = buildProofExplanation(raw.reviews, proof.score, proof.stars, proof.coinMax);
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
  console.log('Haial v9.4 Scoring Engine (per-coin):');
  COINS.forEach(function(c) {
    console.log('  ' + c.emoji + ' ' + c.ticker.padEnd(5) + '\u2192 ' + c.category.padEnd(12) +
      'Proof: ' + c.proof.score + (c.proof.stars > 0 ? ' (' + '\u2605'.repeat(c.proof.stars) + ')' : ''));
  });
}
