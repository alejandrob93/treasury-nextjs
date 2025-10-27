export async function GET() {
  const apiKey = process.env.FRED_API_KEY;
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;

  const res = await fetch(url);
  const data = await res.json();
  const latest = data.observations[0];

  return new Response(JSON.stringify({
    results: [
      {
        id: 'DGS10',
        latest: {
          date: latest.date,
          value: Number(latest.value)
        }
      }
    ]
  }), { headers: { 'Content-Type': 'application/json' } });
}
