/* ═══════════════════════════════════════
   HAIAL — Coin Database + Scoring Engine
   Sources carry opinions → auto-calculates
   proof score + haial status
   ═══════════════════════════════════════ */

// ── Source Authority Registry ──
// Each source has a weight reflecting its scholarly authority
const SOURCE_AUTHORITY = {
  'IFG':       { fullName: 'Islamic Finance Guru',     weight: 30, tier: 'primary' },
  'PIF':       { fullName: 'Practical Islamic Finance', weight: 30, tier: 'primary' },
  'Amanah':    { fullName: 'Amanah Advisors',          weight: 25, tier: 'secondary' },
  'Sharlife':  { fullName: 'Sharlife',                  weight: 20, tier: 'secondary' },
  'Community': { fullName: 'Community Consensus',       weight: 10, tier: 'community' },
};

const MAX_WEIGHT = Object.values(SOURCE_AUTHORITY).reduce(function(sum, s) { return sum + s.weight; }, 0); // 115

// ── Opinion types ──
// halal    = permissible
// caution  = permissible with conditions (counts as positive)
// review   = under review / unclear
// haram    = not permissible

// ── Scoring Algorithm ──
function calculateProofScore(reviews) {
  if (!reviews || reviews.length === 0) return { score: 0, stars: 0 };

  // Sum authority weights
  var rawWeight = 0;
  reviews.forEach(function(r) {
    var auth = SOURCE_AUTHORITY[r.source];
    if (auth) rawWeight += auth.weight;
  });

  // Normalize to 0-100
  var score = Math.round((rawWeight / MAX_WEIGHT) * 100);
  if (score > 100) score = 100;

  // Stars = depth of scholarly consensus
  var formalCount = reviews.filter(function(r) {
    var auth = SOURCE_AUTHORITY[r.source];
    return auth && auth.tier !== 'community';
  }).length;

  var stars = 0;
  if (formalCount >= 2) stars = 1;         // 2+ formal scholars agree
  if (formalCount >= 3) stars = 2;         // 3+ formal scholars
  if (formalCount >= 4) stars = 3;         // near-unanimous formal consensus

  return { score: score, stars: stars };
}

// ── Status Algorithm ──
function calculateStatus(reviews) {
  if (!reviews || reviews.length === 0) return 'Preliminary';
  if (reviews.length === 1) return 'Preliminary'; // 1 source = not enough

  var opinions = reviews.map(function(r) { return r.opinion; });

  var hasHalal   = opinions.includes('halal');
  var hasCaution = opinions.includes('caution');
  var hasHaram   = opinions.includes('haram');
  var hasReview  = opinions.includes('review');

  var positive = opinions.filter(function(o) { return o === 'halal' || o === 'caution'; }).length;
  var negative = opinions.filter(function(o) { return o === 'haram'; }).length;

  // Any disagreement or explicit review → Review
  if (hasReview) return 'Review';
  if (positive > 0 && negative > 0) return 'Review';

  // All agree
  if (negative === opinions.length) return 'Haram';
  if (positive === opinions.length) return 'Halal';

  return 'Review';
}

// ── Emoji from status ──
function statusEmoji(status) {
  if (status === 'Halal') return '\u2705';       // ✅
  if (status === 'Haram') return '\u274C';        // ❌
  if (status === 'Review') return '\u26A0\uFE0F'; // ⚠️
  return '\uD83D\uDD0D';                          // 🔍 Preliminary
}

// ── Build fatwa strings from reviews ──
function buildFatwas(reviews) {
  return reviews.map(function(r) {
    var auth = SOURCE_AUTHORITY[r.source];
    var name = auth ? auth.fullName : r.source;
    return name + ': ' + r.note;
  });
}

// ── Raw Coin Data (human-authored) ──
// Only input: reviews with source + opinion + note
// Everything else is auto-calculated
var COINS_RAW = [
  {
    name: 'Bitcoin', ticker: 'BTC', updated: '15 Jan 2026', trend: 'up',
    reasoning: 'Bitcoin is permissible as a decentralized store of value and medium of exchange, similar to digital gold. No interest-based mechanisms.',
    businessModel: 'Decentralized peer-to-peer digital currency with no central authority.',
    tokenomics: 'Fixed supply of 21M coins, deflationary, Proof of Work.',
    reviews: [
      { source: 'IFG',    opinion: 'halal', note: 'Permissible as digital gold' },
      { source: 'PIF',    opinion: 'halal', note: 'Allowed for spot trading' },
      { source: 'Amanah', opinion: 'halal', note: 'Halal for long-term holding' },
    ]
  },
  {
    name: 'Ethereum', ticker: 'ETH', updated: '15 Jan 2026', trend: 'neutral',
    reasoning: 'Permissible due to smart contract utility. Post-merge eliminates most energy concerns.',
    businessModel: 'Decentralized platform for smart contracts and dApps.',
    tokenomics: 'Proof of Stake, inflationary with burn mechanism (EIP-1559).',
    reviews: [
      { source: 'IFG', opinion: 'halal',   note: 'Permissible for utility' },
      { source: 'PIF', opinion: 'caution',  note: 'Allowed with caution on DeFi lending' },
    ]
  },
  {
    name: 'Cardano', ticker: 'ADA', updated: '12 Jan 2026', trend: 'up',
    reasoning: 'Highly permissible — peer-reviewed academic approach, focus on sustainability and social impact.',
    businessModel: 'Research-driven blockchain with focus on sustainability.',
    tokenomics: 'Proof of Stake (Ouroboros), max supply 45B ADA.',
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
    reasoning: 'Permissible as high-performance smart contract platform with real utility. Some centralization concerns.',
    businessModel: 'High-throughput blockchain for dApps and DeFi.',
    tokenomics: 'Proof of History + PoS. Inflationary with decreasing rate.',
    reviews: [
      { source: 'IFG',       opinion: 'caution', note: 'Permissible with caution on centralization' },
      { source: 'Community', opinion: 'halal',    note: 'Generally accepted' },
    ]
  },
  {
    name: 'XRP', ticker: 'XRP', updated: '08 Jan 2026', trend: 'neutral',
    reasoning: 'Under review — centralized nature of Ripple Labs and ongoing legal proceedings. Cross-border utility is legitimate.',
    businessModel: 'Cross-border payment settlement network.',
    tokenomics: 'Pre-mined with scheduled escrow releases.',
    reviews: [
      { source: 'PIF',       opinion: 'review', note: 'Under review — centralization concerns' },
      { source: 'Community', opinion: 'caution', note: 'Mixed opinions, utility recognized' },
    ]
  },
  {
    name: 'Chainlink', ticker: 'LINK', updated: '05 Jan 2026', trend: 'up',
    reasoning: 'Permissible as oracle network providing essential blockchain infrastructure. Clear utility beyond speculation.',
    businessModel: 'Decentralized oracle network for smart contracts.',
    tokenomics: 'Fixed supply of 1B LINK. Used for staking and payments.',
    reviews: [
      { source: 'IFG',    opinion: 'halal', note: 'Permissible — clear utility' },
      { source: 'Amanah', opinion: 'halal', note: 'Approved' },
    ]
  },
  {
    name: 'Dogecoin', ticker: 'DOGE', updated: '15 Jan 2026', trend: 'down',
    reasoning: 'Not permissible — originated as meme with no real utility. Heavily speculative, resembles gambling (maisir).',
    businessModel: 'Meme-based cryptocurrency with no utility.',
    tokenomics: 'Unlimited inflationary supply.',
    reviews: [
      { source: 'IFG',       opinion: 'haram', note: 'Speculative gambling, no utility' },
      { source: 'PIF',       opinion: 'haram', note: 'Not permissible — maisir' },
      { source: 'Community', opinion: 'haram', note: 'Consensus: pure speculation' },
    ]
  },
  {
    name: 'Shiba Inu', ticker: 'SHIB', updated: '15 Jan 2026', trend: 'down',
    reasoning: 'Not permissible. Pure meme token — no utility, trading driven entirely by speculation and hype.',
    businessModel: 'Meme token with no inherent utility.',
    tokenomics: 'Quadrillion initial supply. Marketing-driven burns.',
    reviews: [
      { source: 'IFG',       opinion: 'haram', note: 'No utility, speculative' },
      { source: 'PIF',       opinion: 'haram', note: 'Pure speculation' },
      { source: 'Community', opinion: 'haram', note: 'Consensus: gambling' },
    ]
  },
  {
    name: 'Polygon', ticker: 'POL', updated: '03 Jan 2026', trend: 'neutral',
    reasoning: 'Permissible as Layer-2 scaling solution for Ethereum. Genuine utility reducing costs and improving accessibility.',
    businessModel: 'Layer-2 scaling solution for Ethereum ecosystem.',
    tokenomics: 'Fixed supply. Used for staking, governance, gas fees.',
    reviews: [
      { source: 'IFG', opinion: 'halal', note: 'Permissible' },
      { source: 'PIF', opinion: 'halal', note: 'Allowed' },
    ]
  },
  {
    name: 'Avalanche', ticker: 'AVAX', updated: '01 Jan 2026', trend: 'up',
    reasoning: 'Preliminary assessment. Smart contract platform with genuine utility — requires further scholarly review on DeFi mechanisms.',
    businessModel: 'Decentralized platform with subnet architecture.',
    tokenomics: 'Capped 720M AVAX. PoS with burn mechanism.',
    reviews: [
      { source: 'Community', opinion: 'halal', note: 'Likely permissible — awaiting formal review' },
    ]
  },
];

// ── Process: auto-calculate everything ──
var COINS = COINS_RAW.map(function(raw) {
  var proof = calculateProofScore(raw.reviews);
  var category = calculateStatus(raw.reviews);
  var emoji = statusEmoji(category);
  var sources = raw.reviews.map(function(r) { return r.source; });
  var fatwas = buildFatwas(raw.reviews);

  return {
    name: raw.name,
    ticker: raw.ticker,
    category: category,
    sources: sources,
    proof: proof,
    emoji: emoji,
    updated: raw.updated,
    trend: raw.trend,
    reasoning: raw.reasoning,
    businessModel: raw.businessModel,
    tokenomics: raw.tokenomics,
    fatwas: fatwas,
    reviews: raw.reviews, // keep raw reviews for detail view
  };
});

// ── Debug: log calculated results ──
if (typeof console !== 'undefined') {
  console.log('Haial Scoring Engine:');
  COINS.forEach(function(c) {
    console.log(
      '  ' + c.emoji + ' ' + c.ticker.padEnd(5) +
      '→ ' + c.category.padEnd(12) +
      'Proof: ' + c.proof.score + (c.proof.stars > 0 ? ' ' + '★'.repeat(c.proof.stars) : '') +
      '  (' + c.sources.join(', ') + ')'
    );
  });
}
