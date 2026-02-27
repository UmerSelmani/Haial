# Haial Platform v9.3

**Faith. Data. Clarity.**

Haial is a Shariah-compliant cryptocurrency screening platform that helps the Muslim community make informed, halal investment decisions. It combines scholarly research from trusted Islamic finance authorities with transparent scoring algorithms.

## Features

- **Coin Database** — 10 coins with full Shariah analysis, auto-calculated proof scores and halal status
- **Scoring Engine** — Source-opinion-based algorithm that automatically determines halal/haram/review/preliminary status and confidence scores
- **AI Compliance Checker** — Search any coin against the database for instant rulings
- **Live Streams** — Two RSS-powered news feeds:
  - Islamic Sources: IFG, Practical Islamic Finance, Musaffa Academy
  - Coin News: CoinTelegraph, CoinDesk, Bitcoin Magazine, Decrypt (filtered to halal coins only)
- **5 Languages** — English, Arabic (RTL), Turkish, Albanian, Russian
- **Dark/Light Mode** — System-aware with manual toggle
- **Learn Section** — Educational content on Islamic crypto principles
- **Signals Tab** — MTFCM integration placeholder for technical analysis
- **Mobile Responsive** — Full touch support, works on all devices

## Scoring Engine

The proof score and halal status are **automatically calculated** from source reviews. No manual overrides.

### How It Works

Each coin has a `reviews` array. Each review contains:
- `source` — Who reviewed it (IFG, PIF, Amanah, Sharlife, Community)
- `opinion` — Their ruling (halal, caution, haram, review)
- `note` — Brief explanation

The engine then calculates:

**Proof Score (0-100):** Weighted sum of source authority
| Source | Weight | Tier |
|--------|--------|------|
| IFG | 30 | Primary |
| PIF | 30 | Primary |
| Amanah | 25 | Secondary |
| Sharlife | 20 | Secondary |
| Community | 10 | Community |

**Stars (0-3):** Depth of formal scholarly consensus
- ★ = 2+ formal (non-community) sources agree
- ★★ = 3+ formal sources
- ★★★ = 4+ formal sources (near-unanimous)

**Status:** Derived from opinion agreement
- 0-1 sources → Preliminary (not enough evidence)
- 2+ all positive (halal/caution) → Halal
- 2+ all negative (haram) → Haram
- Any "review" opinion or disagreement → Review

### Adding a New Coin

Add an entry to `COINS_RAW` in `js/data.js`:

```js
{
  name: 'Toncoin', ticker: 'TON', updated: '26 Feb 2026', trend: 'up',
  reasoning: 'Smart contract platform with messaging integration...',
  businessModel: 'Decentralized blockchain linked to Telegram...',
  tokenomics: 'PoS, 5B total supply...',
  reviews: [
    { source: 'IFG', opinion: 'halal', note: 'Permissible — real utility' },
    { source: 'PIF', opinion: 'caution', note: 'Allowed with caution' },
  ]
}
```

Everything else (status, emoji, score, stars, fatwas) is auto-generated.

## File Structure

```
haial-v9/
├── index.html          — HTML shell (loads CDN + local files)
├── README.md           — This file
├── css/
│   └── styles.css      — Full styling, themes, RTL, animations
└── js/
    ├── icons.js         — SVG icon library
    ├── i18n.js          — 5-language translations
    ├── data.js          — Coin database + scoring engine
    ├── app.js           — State, routing, render engine
    └── pages/
        ├── home.js      — Coin table + AI checker
        ├── streams.js   — Live RSS news feeds
        ├── learn.js     — Education content
        ├── signals.js   — MTFCM placeholder
        └── about.js     — Mission/ethos
```

## Tech Stack

- Vanilla HTML/CSS/JS — no build tools, no frameworks
- RSS via rss2json.com proxy (free, no API key)
- Binance API ready for live prices
- Deployable to Cloudflare Pages, Netlify, or any static host

## Deployment

Static site — just upload the folder. No backend needed.

**Cloudflare Pages:** Add `wrangler.jsonc` to root:
```json
{
  "name": "haial",
  "compatibility_date": "2026-02-26",
  "assets": { "directory": "./" }
}
```

## Halal Compliance

- Spot trading focus only — no leverage, futures, or margin
- No interest-based instruments
- All coins reviewed against Shariah principles
- Sources credited and linked transparently
- Ad-free (future: halal-filtered ads only)

## License

© Haial 2025–2026 — Umer Selmani
