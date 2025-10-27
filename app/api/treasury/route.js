// app/api/treasury/route.js
const SERIES_IDS = ['DGS2', 'DGS5', 'DGS10', 'DGS30'];

/**
 * Helper: fetch the most recent non-missing observation for a series.
 */
async function fetchLatestFor(id, apiKey) {
  // Ask FRED for the most recent 30 daily points (descending)
  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${id}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=30`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`FRED error for ${id}: ${res.status}`);

  const data = await res.json();
  // Find the first valid value (FRED sometimes returns '.' for missing)
  const latest = (data.observations || []).find(o => o.value && o.value !== '.');

  return {
    id,
    latest: latest
      ? { date: latest.date, value: Number(latest.value) }
      : null,
  };
}

export async function GET() {
  try {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing FRED_API_KEY' }), { status: 500 });
    }

    const results = await Promise.all(SERIES_IDS.map(id => fetchLatestFor(id, apiKey)));

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch FRED data' }), { status: 500 });
  }
}
