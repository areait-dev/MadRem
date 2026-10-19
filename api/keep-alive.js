// Cron giornaliero (vercel.json): genera attività sul database per evitare la messa in pausa di Supabase.
// Le credenziali arrivano solo dalle variabili d'ambiente del progetto Vercel.
// Se è impostato CRON_SECRET, Vercel lo invia come "Authorization: Bearer <secret>" e qualsiasi altra chiamata viene rifiutata.
export default async function handler(request, response) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.authorization !== `Bearer ${secret}`) {
    return response.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response.status(500).json({
      success: false,
      error: 'Variabili VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY non configurate',
    });
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/domains?select=id&limit=1`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Supabase returned status: ${res.status}`);
    }

    return response.status(200).json({
      success: true,
      message: 'Supabase database pinged successfully to keep it active.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
