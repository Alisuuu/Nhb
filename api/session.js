import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Configurar CORS para permitir que o frontend acesse a API
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verifica se a chave da API está configurada
  if (!process.env.HB_API_KEY) {
    return res.status(500).json({ error: 'HB_API_KEY não configurada no Vercel.' });
  }

  try {
    const response = await fetch('https://engine.hyperbeam.com/v0/vm', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        region: 'NA', // Pode mudar para 'EU' ou 'AS'
        timeout: {
             absolute: 60 * 60 * 3 // 3 horas de limite
        },
        ublock: true // Bloqueador de anúncios
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Falha ao criar VM');
    }

    // Retorna o embed_url para o frontend
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
