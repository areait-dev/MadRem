export default async function handler(request, response) {
  // Use env variables or fallback to committed project values
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://obwzmkjdfgxkyxjlbiwz.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9id3pta2pkZmd4a3l4amxiaXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODY2ODEsImV4cCI6MjA5NDE2MjY4MX0.8gSMjCWeku9OU49TOXJ6J0XF_OhYKRIbeRwgYa7-cmc';

  try {
    // Ping a public table to generate activity in the database
    const res = await fetch(`${supabaseUrl}/rest/v1/domains?limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!res.ok) {
      throw new Error(`Supabase returned status: ${res.status}`);
    }

    const data = await res.json();
    return response.status(200).json({
      success: true,
      message: 'Supabase database pinged successfully to keep it active.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
