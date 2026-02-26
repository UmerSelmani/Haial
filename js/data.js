/* ═══════════════════════════════════════
   HAIAL — Coin Database
   10 real coins with Shariah analysis
   ═══════════════════════════════════════ */

const COINS = [
  {
    name: 'Bitcoin', ticker: 'BTC', category: 'Halal',
    sources: ['IFG', 'PIF', 'Amanah'],
    proof: { score: 100, stars: 2 },
    emoji: '✅', updated: '15 Jan 2026', trend: 'up',
    reasoning: 'Bitcoin is permissible as a decentralized store of value and medium of exchange, similar to digital gold. No interest-based mechanisms.',
    businessModel: 'Decentralized peer-to-peer digital currency with no central authority.',
    tokenomics: 'Fixed supply of 21M coins, deflationary, Proof of Work.',
    fatwas: [
      'IFG: Permissible as digital gold',
      'PIF: Allowed for spot trading',
      'Amanah: Halal for long-term holding'
    ]
  },
  {
    name: 'Ethereum', ticker: 'ETH', category: 'Halal',
    sources: ['IFG', 'PIF'],
    proof: { score: 100, stars: 0 },
    emoji: '✅', updated: '15 Jan 2026', trend: 'neutral',
    reasoning: 'Permissible due to smart contract utility. Post-merge eliminates most energy concerns.',
    businessModel: 'Decentralized platform for smart contracts and dApps.',
    tokenomics: 'Proof of Stake, inflationary with burn mechanism (EIP-1559).',
    fatwas: [
      'IFG: Permissible for utility',
      'PIF: Allowed with caution on DeFi lending'
    ]
  },
  {
    name: 'Cardano', ticker: 'ADA', category: 'Halal',
    sources: ['IFG', 'PIF', 'Amanah', 'Sharlife', 'Community'],
    proof: { score: 100, stars: 3 },
    emoji: '✅', updated: '12 Jan 2026', trend: 'up',
    reasoning: 'Highly permissible — peer-reviewed academic approach, focus on sustainability and social impact.',
    businessModel: 'Research-driven blockchain with focus on sustainability.',
    tokenomics: 'Proof of Stake (Ouroboros), max supply 45B ADA.',
    fatwas: [
      'IFG: Strongly permissible',
      'PIF: Recommended',
      'Amanah: Halal',
      'Sharlife: Approved'
    ]
  },
  {
    name: 'Solana', ticker: 'SOL', category: 'Halal',
    sources: ['IFG', 'Community'],
    proof: { score: 85, stars: 1 },
    emoji: '✅', updated: '10 Jan 2026', trend: 'up',
    reasoning: 'Permissible as high-performance smart contract platform with real utility. Some centralization concerns.',
    businessModel: 'High-throughput blockchain for dApps and DeFi.',
    tokenomics: 'Proof of History + PoS. Inflationary with decreasing rate.',
    fatwas: [
      'IFG: Permissible with caution',
      'Community: Generally accepted'
    ]
  },
  {
    name: 'XRP', ticker: 'XRP', category: 'Review',
    sources: ['PIF', 'Community'],
    proof: { score: 70, stars: 1 },
    emoji: '⚠️', updated: '08 Jan 2026', trend: 'neutral',
    reasoning: 'Under review — centralized nature of Ripple Labs and ongoing legal proceedings. Cross-border utility is legitimate.',
    businessModel: 'Cross-border payment settlement network.',
    tokenomics: 'Pre-mined with scheduled escrow releases.',
    fatwas: [
      'PIF: Under review',
      'Community: Mixed opinions'
    ]
  },
  {
    name: 'Chainlink', ticker: 'LINK', category: 'Halal',
    sources: ['IFG', 'Amanah'],
    proof: { score: 100, stars: 1 },
    emoji: '✅', updated: '05 Jan 2026', trend: 'up',
    reasoning: 'Permissible as oracle network providing essential blockchain infrastructure. Clear utility beyond speculation.',
    businessModel: 'Decentralized oracle network for smart contracts.',
    tokenomics: 'Fixed supply of 1B LINK. Used for staking and payments.',
    fatwas: [
      'IFG: Permissible — clear utility',
      'Amanah: Approved'
    ]
  },
  {
    name: 'Dogecoin', ticker: 'DOGE', category: 'Haram',
    sources: [],
    proof: { score: 0, stars: 0 },
    emoji: '❌', updated: '15 Jan 2026', trend: 'down',
    reasoning: 'Not permissible — originated as meme with no real utility. Heavily speculative, resembles gambling (maisir).',
    businessModel: 'Meme-based cryptocurrency with no utility.',
    tokenomics: 'Unlimited inflationary supply.',
    fatwas: ['Consensus: Speculative gambling']
  },
  {
    name: 'Shiba Inu', ticker: 'SHIB', category: 'Haram',
    sources: [],
    proof: { score: 0, stars: 0 },
    emoji: '❌', updated: '15 Jan 2026', trend: 'down',
    reasoning: 'Not permissible. Pure meme token — no utility, trading driven entirely by speculation and hype.',
    businessModel: 'Meme token with no inherent utility.',
    tokenomics: 'Quadrillion initial supply. Marketing-driven burns.',
    fatwas: ['Consensus: Pure speculation']
  },
  {
    name: 'Polygon', ticker: 'POL', category: 'Halal',
    sources: ['IFG', 'PIF'],
    proof: { score: 100, stars: 0 },
    emoji: '✅', updated: '03 Jan 2026', trend: 'neutral',
    reasoning: 'Permissible as Layer-2 scaling solution for Ethereum. Genuine utility reducing costs and improving accessibility.',
    businessModel: 'Layer-2 scaling solution for Ethereum ecosystem.',
    tokenomics: 'Fixed supply. Used for staking, governance, gas fees.',
    fatwas: [
      'IFG: Permissible',
      'PIF: Allowed'
    ]
  },
  {
    name: 'Avalanche', ticker: 'AVAX', category: 'Preliminary',
    sources: ['Community'],
    proof: { score: 60, stars: 0 },
    emoji: '🔍', updated: '01 Jan 2026', trend: 'up',
    reasoning: 'Preliminary assessment. Smart contract platform with genuine utility — requires further scholarly review on DeFi mechanisms.',
    businessModel: 'Decentralized platform with subnet architecture.',
    tokenomics: 'Capped 720M AVAX. PoS with burn mechanism.',
    fatwas: ['Community: Likely permissible — awaiting review']
  },
];

// Stream sources data
const STREAM_SOURCES = [
  { name: 'Islamic Finance Guru', desc: 'Independent Islamic finance research and guidance' },
  { name: 'Practical Islamic Finance', desc: 'Practical Shariah-compliant investment analysis' },
  { name: 'Amanah Advisors', desc: 'Shariah advisory and Islamic financial consulting' },
];
