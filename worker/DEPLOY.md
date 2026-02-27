# Haial AI Worker — Deployment Guide

## Prerequisites
- Cloudflare account (free tier works)
- Anthropic API key
- Node.js installed

## Steps

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 2. Create KV namespace for rate limiting
```bash
cd worker/
wrangler kv:namespace create "HAIAL_KV"
```
Copy the `id` from the output and paste it into `wrangler.toml`.

### 3. Set your Anthropic API key as a secret
```bash
wrangler secret put ANTHROPIC_API_KEY
```
Paste your key when prompted.

### 4. Deploy
```bash
wrangler deploy
```

### 5. Note your worker URL
It will be something like: `https://haial-ai.YOUR_SUBDOMAIN.workers.dev`

### 6. Update frontend
In `js/app.js`, set `HAIAL_AI_ENDPOINT` to your worker URL.

## Rate Limiting
- 3 AI analyses per IP per day
- Resets at midnight UTC
- Uses KV storage (free tier: 100k reads/day, 1k writes/day)

## Costs
- Cloudflare Worker: Free (100k requests/day)
- Cloudflare KV: Free tier sufficient
- Anthropic API: ~$0.003-0.01 per analysis (Sonnet 4)
- At 3 checks/day × 1000 users = ~$3-10/day max
