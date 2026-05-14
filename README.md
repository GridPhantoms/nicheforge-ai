# NicheForge AI

Private beta for AI Business Angle Reports.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required env vars:

- `XAI_API_KEY`
- `NICHEFORGE_BETA_CODE`
- `NICHEFORGE_MODEL` optional, defaults to `grok-4-0709`

## Routes

- `/` neutral public homepage
- `/forge` beta-code gated report generator
- `/disclaimer` safety/disclaimer page
