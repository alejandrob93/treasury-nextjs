// app/api/treasury/route.js

export async function GET() {
  try {
    // 👇 Access the FRED API key from your environment variables
    const apiKey = process.env.FRED_API_KEY;

    // 👇 Example: 10-Year Treasury yield (DGS10)
    const seriesId = 'DGS10';
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

    const response = await fetch(url);
    const data = await response.json();

    // 👇 Return the data as JSON
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching data from FRED:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch treasury data' }),
      { status: 500 }
    );
  }
}
