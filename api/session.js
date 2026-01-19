import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!process.env.HB_API_KEY) {
    return res.status(500).json({ error: 'HB_API_KEY não configurada.' });
  }

  try {
    // Usando WHATWG URL API para evitar avisos de depreciação e erros no Vercel
    const urlObj = new URL(req.url, `https://${req.headers.host}`);
    const sessionId = urlObj.searchParams.get('sessionId');
    
    let url = 'https://engine.hyperbeam.com/v0/vm';
    let options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        region: 'NA',
        timeout: { absolute: 60 * 120 }, // 2 horas
        ublock: true
      })
    };

    if (sessionId) {
      url = `https://engine.hyperbeam.com/v0/vm/${sessionId}`;
      options = {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${process.env.HB_API_KEY}` }
      };
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Falha na operação Hyperbeam');
    }

    // Garante que o session_id sempre volte para o frontend
    res.status(200).json({
        session_id: data.session_id || sessionId,
        embed_url: data.embed_url
    });

  } catch (error) {
    console.error("Erro na API:", error.message);
    res.status(500).json({ error: error.message });
  }
}