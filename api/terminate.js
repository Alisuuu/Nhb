import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID é obrigatório' });
  }

  try {
    const response = await fetch(`https://engine.hyperbeam.com/v0/vm/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.HB_API_KEY}`
      }
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const errData = await response.json();
      res.status(response.status).json(errData);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
