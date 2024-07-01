import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, rm } from 'fs/promises';
import path from 'path';
import simpleGit from 'simple-git';
import fs from 'fs';
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

      // Log the environment variable directly to check if it is correctly read
      console.log('SSH_PRIVATE_KEY (raw):', process.env.SSH_PRIVATE_KEY);

      // Write SSH key to file
      const sshKeyPath = path.join('/tmp', 'id_ed25519');
      const sshKeyContent = process.env.SSH_PRIVATE_KEY;

      // Log the SSH key content to ensure the new lines are replaced correctly
      console.log('SSH Key Content:', sshKeyContent);

      await writeFile(sshKeyPath, sshKeyContent, { mode: 0o600 });

      // Verify the key file content
      const writtenKeyContent = await fs.promises.readFile(sshKeyPath, 'utf-8');
      console.log('Written SSH Key Content:', writtenKeyContent);

      // Setup SSH agent
      const sshAgentOutput = await execAsync('ssh-agent -s');
      console.log('SSH Agent Output:', sshAgentOutput.stdout); // Log SSH Agent Output for debugging
      const sshAgentPid = sshAgentOutput.stdout.match(/SSH_AGENT_PID=(\d+)/)[1];
      process.env.SSH_AGENT_PID = sshAgentPid;

      await execAsync(`ssh-add ${sshKeyPath}`);

      // Initialize simple-git with the correct directory
      const git = simpleGit('/tmp');

      const repoPath = path.join('/tmp', 'SummerLuck');

      // Remove the existing directory if it exists
      try {
        await rm(repoPath, { recursive: true, force: true });
        console.log('Removed existing directory:', repoPath);
      } catch (error) {
        console.log('Error removing directory:', error);
      }

      // Clone the repository
      await git.clone('git@github.com:oguzutku1745/SummerLuck.git');

      // Log the GitHub token and URL for debugging
      console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? 'Available' : 'Not available');
      const githubApiUrl = `https://api.github.com/repos/oguzutku1745/SummerLuck/actions/workflows/update-env.yml/dispatches`;
      console.log('GitHub API URL:', githubApiUrl);

      // Trigger the GitHub Action
      const response = await fetch(githubApiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            casterName,
            raffleAddress
          }
        })
      });

      // Log the response status and text for debugging
      console.log('Response Status:', response.status);
      console.log('Response Text:', await response.text());

      if (!response.ok) {
        throw new Error(`GitHub Action dispatch failed: ${response.statusText}`);
      }

      res.status(200).json({ message: 'Raffle created and GitHub Action triggered successfully' });

      // Clean up the SSH key file
      await unlink(sshKeyPath);
    } catch (error) {
      console.error('Error creating custom raffle:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    console.log('Method not allowed');
    res.status(405).json({ error: 'Method not allowed' });
  }
}
