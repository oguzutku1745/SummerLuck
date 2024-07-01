import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { casterName, raffleAddress } = req.body;

    if (!casterName || !raffleAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Trigger the GitHub Action
      const response = await fetch(`https://api.github.com/repos/oguzutku1745/SummerLuck/actions/workflows/create-custom-raffle.yml/dispatches`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            casterName,
            raffleAddress
          }
        })
      });

      if (response.ok) {
        res.status(200).json({ message: 'Raffle creation initiated successfully' });
      } else {
        res.status(response.status).json({ error: 'Failed to initiate raffle creation' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
