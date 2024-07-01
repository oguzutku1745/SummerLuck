import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

export default async function handler(req, res) {
  console.log('Received request');
  if (req.method === 'POST') {
    console.log('POST request received');
    const { casterName, raffleAddress } = req.body;

    if (!casterName || !raffleAddress) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      console.log('Starting process');
      
      // Calculate the custom index (this should be retrieved or generated)
      const customIndex = Date.now(); // or another method to generate a unique index

      // Trigger the GitHub Action
      const response = await fetch(`https://api.github.com/repos/oguzutku1745/SummerLuck/actions/workflows/update-raffle.yml/dispatches`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            casterName,
            raffleAddress,
            customIndex
          }
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub Action dispatch failed: ${response.statusText}`);
      }

      res.status(200).json({ message: 'Raffle created and GitHub Action triggered successfully' });

    } catch (error) {
      console.error('Error creating custom raffle:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    console.log('Method not allowed');
    res.status(405).json({ error: 'Method not allowed' });
  }
}
