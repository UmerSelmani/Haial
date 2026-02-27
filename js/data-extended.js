/* ═══════════════════════════════════════
   HAIAL v9.4 — Extended Source Database (Tier 2)
   Pre-cataloged coins from IFG, PIF, Amanah, Sharlife
   Used when coin not in main database
   ═══════════════════════════════════════ */

var EXTENDED_COINS = [
  // ── IFG reviewed coins not in main DB ──
  { name: 'Litecoin',    ticker: 'LTC',   verdict: 'halal',   source: 'IFG', note: 'Straightforward cryptocurrency, permissible like BTC' },
  { name: 'Tether',      ticker: 'USDT',  verdict: 'caution', source: 'IFG', note: 'Backed by interest-bearing instruments, but holder does not directly own the debt' },
  { name: 'USD Coin',    ticker: 'USDC',  verdict: 'caution', source: 'IFG', note: 'Similar concerns to USDT regarding reserve composition' },
  { name: 'DAI',         ticker: 'DAI',   verdict: 'caution', source: 'IFG', note: 'Creation mechanism has some discussion, but fundamentally a cryptocurrency. Dai Savings Rate is separate and not commented on' },
  { name: 'Aave',        ticker: 'AAVE',  verdict: 'haram',   source: 'IFG', note: 'Lending ecosystem — borrowing crypto and returning more is straightforwardly riba. Token value inextricably linked to lending activity' },
  { name: 'Uniswap',     ticker: 'UNI',   verdict: 'caution', source: 'IFG', note: 'DEX governance token. The exchange itself is permissible but some pools may involve haram tokens' },
  { name: 'Monero',      ticker: 'XMR',   verdict: 'caution', source: 'IFG', note: 'Nothing technically haram but strong criminal uptake raises taqwa concerns about adding liquidity and value' },
  { name: 'BNB',         ticker: 'BNB',   verdict: 'caution', source: 'IFG', note: 'Exchange utility token. Binance offers margin/futures which raises questions, but BNB itself has utility' },
  { name: 'Toncoin',     ticker: 'TON',   verdict: 'halal',   source: 'IFG', note: 'Layer-1 blockchain with real utility for decentralized applications' },
  { name: 'Stellar',     ticker: 'XLM',   verdict: 'halal',   source: 'IFG', note: 'Cross-border payments and financial inclusion — aligns with Islamic finance goals' },
  { name: 'Algorand',    ticker: 'ALGO',  verdict: 'halal',   source: 'IFG', note: 'Pure Proof of Stake blockchain, legitimate utility for dApps and DeFi infrastructure' },
  { name: 'VeChain',     ticker: 'VET',   verdict: 'halal',   source: 'IFG', note: 'Supply chain management and enterprise blockchain solutions — clear real-world utility' },
  { name: 'Cosmos',      ticker: 'ATOM',  verdict: 'halal',   source: 'IFG', note: 'Interoperability protocol connecting blockchains — legitimate infrastructure utility' },
  { name: 'Internet Computer', ticker: 'ICP', verdict: 'caution', source: 'IFG', note: 'Decentralized cloud computing. Innovative but governance concentration raises some concerns' },
  { name: 'Filecoin',    ticker: 'FIL',   verdict: 'halal',   source: 'IFG', note: 'Decentralized storage network — clear utility, miners provide real service' },
  { name: 'Hedera',      ticker: 'HBAR',  verdict: 'halal',   source: 'IFG', note: 'Enterprise-grade distributed ledger with governing council of major institutions' },

  // ── PIF reviewed coins ──
  { name: 'Near Protocol', ticker: 'NEAR', verdict: 'halal',  source: 'PIF', note: 'Layer-1 smart contract platform with sharding technology — legitimate utility' },
  { name: 'Sui',          ticker: 'SUI',  verdict: 'halal',   source: 'PIF', note: 'Move-based Layer-1 blockchain, object-centric model, real development activity' },
  { name: 'Aptos',        ticker: 'APT',  verdict: 'halal',   source: 'PIF', note: 'Move-based Layer-1 by former Meta engineers. Clear infrastructure utility' },
  { name: 'Injective',    ticker: 'INJ',  verdict: 'caution', source: 'PIF', note: 'DeFi-focused Layer-1. Derivatives trading capability raises concerns' },
  { name: 'Render',       ticker: 'RENDER', verdict: 'halal', source: 'PIF', note: 'Decentralized GPU rendering network — clear real-world utility for artists and developers' },
  { name: 'Fetch.ai',     ticker: 'FET',  verdict: 'halal',   source: 'PIF', note: 'AI and machine learning blockchain infrastructure — legitimate technology utility' },
  { name: 'Arweave',      ticker: 'AR',   verdict: 'halal',   source: 'PIF', note: 'Permanent decentralized data storage — clear utility, one-time payment model' },

  // ── Multiple source confirmations ──
  { name: 'Tezos',        ticker: 'XTZ',  verdict: 'halal',   source: 'IFG+PIF', note: 'Self-amending blockchain with on-chain governance. Liquid PoS baking considered permissible' },
  { name: 'Polkadot',     ticker: 'DOT',  verdict: 'halal',   source: 'IFG+PIF', note: 'Multi-chain interoperability protocol. Parachain auctions are innovative but permissible' },
  { name: 'Arbitrum',     ticker: 'ARB',  verdict: 'halal',   source: 'PIF', note: 'Layer-2 scaling solution for Ethereum — reduces fees, legitimate infrastructure' },
  { name: 'Optimism',     ticker: 'OP',   verdict: 'halal',   source: 'PIF', note: 'Layer-2 optimistic rollup for Ethereum — legitimate scaling infrastructure' },

  // ── Known haram coins (from multiple sources) ──
  { name: 'Maker',        ticker: 'MKR',  verdict: 'haram',   source: 'IFG+PIF', note: 'Governance token for MakerDAO lending protocol — directly facilitates interest-based lending' },
  { name: 'Compound',     ticker: 'COMP', verdict: 'haram',   source: 'IFG', note: 'DeFi lending protocol governance — value derived from interest-based lending activity' },
  { name: 'Lido',         ticker: 'LDO',  verdict: 'caution', source: 'PIF', note: 'Liquid staking protocol. Staking itself may be permissible but liquid staking derivatives add complexity' },
  { name: 'Pepe',         ticker: 'PEPE', verdict: 'haram',   source: 'IFG+PIF', note: 'Meme coin with zero utility — pure speculation (maysir) and excessive uncertainty (gharar)' },
  { name: 'Floki',        ticker: 'FLOKI', verdict: 'haram',  source: 'PIF', note: 'Meme coin. Despite marketing efforts, core value proposition is speculative' },
  { name: 'Bonk',         ticker: 'BONK', verdict: 'haram',   source: 'PIF', note: 'Solana meme coin — no utility, pure speculation' },
  { name: 'FunToken',     ticker: 'FUN',  verdict: 'haram',   source: 'IFG', note: 'Online casino and gambling token — directly facilitates haram industry' },
  { name: 'Rollbit',      ticker: 'RLB',  verdict: 'haram',   source: 'IFG', note: 'Crypto casino platform token — gambling (maysir) is its primary function' },
  { name: 'Venus',        ticker: 'XVS',  verdict: 'haram',   source: 'PIF', note: 'Lending and borrowing protocol on BNB Chain — interest-based mechanisms (riba)' },

  // ── Stablecoins ──
  { name: 'BUSD',         ticker: 'BUSD', verdict: 'caution', source: 'IFG', note: 'Paxos-issued stablecoin backed by reserves. Similar concerns about interest-bearing reserve instruments' },
  { name: 'TrueUSD',      ticker: 'TUSD', verdict: 'caution', source: 'IFG', note: 'Fiat-backed stablecoin. Reserve composition and potential interest income from reserves' },
  { name: 'Frax',         ticker: 'FRAX', verdict: 'caution', source: 'PIF', note: 'Partially algorithmic stablecoin — novel mechanism raises gharar concerns' },
];

// Lookup function for Tier 2
function findExtendedCoin(query) {
  if (!query) return null;
  var q = query.trim().toLowerCase();
  return EXTENDED_COINS.find(function(c) {
    return c.ticker.toLowerCase() === q || c.name.toLowerCase() === q;
  }) || null;
}
