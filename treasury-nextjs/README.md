# Treasury Yields — Next.js Live Dashboard

A ready-to-deploy **Next.js (App Router)** app that shows **US Treasury constant maturity yields** with a live chart and a serverless API route.

## Deploy to Vercel (recommended)
1. Create a new GitHub repo and upload this folder (see steps below).
2. Go to Vercel → **New Project** → Import your GitHub repo.
3. In **Settings → Environment Variables**, add:
   - `FRED_API_KEY` (get a free key at https://fred.stlouisfed.org/docs/api/api_key.html)
4. Deploy. Your public URL will be live.

## Run locally
```bash
npm i
npm run dev
# open http://localhost:3000
```
Create a `.env` file and add:
```
FRED_API_KEY=your_fred_key_here
```

## GitHub (how to upload)
- Go to https://github.com/new → name it `treasury-nextjs`
- On the repo page → **Add file → Upload files** → drag & drop all files/folders from this project
- Commit.
- Done. Now import this repo into Vercel.

## API
- `GET /api/treasury` → returns `{ timestamp, yields }`
- Uses FRED series: DGS1MO, DGS3, DGS6, DGS1, DGS2, DGS3, DGS5, DGS7, DGS10, DGS20, DGS30.
