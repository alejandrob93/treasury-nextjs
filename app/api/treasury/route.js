// app/api/treasury/route.js

// Which series you want (examples: DGS2, DGS5, DGS10, DGS30)
const SERIES_IDS = ['DGS2', 'DGS5', 'DGS10', 'DGS30'];

export async function GET() {
  try {
    const apiKey = process.env.FRED_API_KEY; // set in Vercel
    const results = await Promise.all(
      SERIES_IDS.map(async (id) => {
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${apiKey}&file_type=json`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`FRED request failed for ${id}`);
        const data = await res.json();

        // grab the most recent non-empty value
        const observations = (data?.observations ?? []).reverse();
        const latest = observations.find(o => o.value && o.value !== '.');

        return { id, latest };
      })
    );

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch FRED data' }), { status: 500 });
  }
}
