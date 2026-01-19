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
    const { sessionId } = req.query;
    let url = 'https://engine.hyperbeam.com/v0/vm';
    let options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        region: 'NA',
        timeout: { absolute: 60 }, // 1 minuto para teste
        ublock: true
      })
    };

    // Se um sessionId for fornecido, tenta recuperar a sessão existente
    if (sessionId) {
      url = `https://engine.hyperbeam.com/v0/vm/${sessionId}`;
      options = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.HB_API_KEY}`
        }
      };
    }

    const response = await fetch(url, options);
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
