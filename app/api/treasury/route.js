// app/api/treasury/route.js
function toArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : String(v).split(',').map(s => s.trim()).filter(Boolean);
}

export async function GET(req) {
  try {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing FRED_API_KEY' }), { status: 500 });

    const { searchParams } = new URL(req.url);
    const series = toArray(searchParams.get('series'))  // e.g. ?series=DGS10,DGS30
      .filter(Boolean);
    const take = Math.max(1, Math.min(120, Number(searchParams.get('last') || 30))); // up to 120 points

    const ids = series.length ? series : ['DGS10']; // default one series

    const results = await Promise.all(
      ids.map(async id => {
        const url =
          `https://api.stlouisfed.org/fred/series/observations` +
          `?series_id=${id}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${take}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`FRED error for ${id}`);

        const data = await res.json();
        const observations = (data.observations || [])
          .filter(o => o.value && o.value !== '.')
          .map(o => ({ date: o.date, value: Number(o.value) }))
          .reverse(); // oldest → newest

        return { id, observations };
      })
    );

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Failed to fetch FRED data' }), { status: 500 });
  }
}
