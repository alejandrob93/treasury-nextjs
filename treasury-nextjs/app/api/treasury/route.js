export const dynamic = 'force-dynamic';

export async function GET() {
  const FRED_API_KEY = process.env.FRED_API_KEY;
  if (!FRED_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing FRED_API_KEY env var' }), { status: 500 });
  }

  const SERIES = {
    '1M': 'DGS1MO',
    '3M': 'DGS3',
    '6M': 'DGS6',
    '1Y': 'DGS1',
    '2Y': 'DGS2',
    '3Y': 'DGS3',
    '5Y': 'DGS5',
    '7Y': 'DGS7',
    '10Y': 'DGS10',
    '20Y': 'DGS20',
    '30Y': 'DGS30',
  };

  try {
    const entries = Object.entries(SERIES);
    const results = await Promise.all(entries.map(async ([label, id]) => {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${FRED_API_KEY}&file_type=json&limit=1`;
      const r = await fetch(url, { next: { revalidate: 0 } });
      if (!r.ok) throw new Error('FRED error ' + r.status);
      const j = await r.json();
      const obs = j.observations?.[j.observations.length - 1];
      const val = obs && obs.value !== '.' ? parseFloat(obs.value) : null;
      return [label, { value: val, date: obs?.date ?? null }];
    }));

    const yields = {};
    let ts = new Date().toISOString();
    for (const [label, obj] of results) {
      yields[label] = obj.value;
      if (obj.date) ts = obj.date;
    }

    return new Response(JSON.stringify({ timestamp: ts, yields }), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Unknown error' }), { status: 500 });
  }
}
