import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, rm } from 'fs/promises';
import path from 'path';
import fs from 'fs-extra';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

const customDirPath = path.join(process.cwd(), 'app/customized');
const customTemplateDir = path.join(customDirPath, 'custom-1');

async function findNextIndex() {
  const dirs = await fs.readdir(customDirPath);
  const customDirs = dirs.filter(dir => dir.startsWith('custom-')).map(dir => parseInt(dir.split('-')[1]));
  const maxIndex = Math.max(...customDirs, 0);
  return maxIndex + 1;
}

async function updateCustomFiles(newCustomDir, index, casterName, raffleAddress) {
  const filesToUpdate = [
    path.join(newCustomDir, 'frames/frames.ts'),
    path.join(newCustomDir, 'page.tsx'),
    path.join(newCustomDir, 'frames/route.tsx'),
    path.join(newCustomDir, 'frames/txdata/route.ts'),
  ];

  const replacements = {
    'process.env.APP_URL': `"https://summer-luck.vercel.app/customized/custom-${index}"`,
    'process.env.VERCEL_URL_1': `"summer-luck.vercel.app/customized/custom-${index}"`,
    'process.env.FARCASTER_NAME_1': `"${casterName}"`,
    'process.env.RAFFLE_ADDRESS_1': `"${raffleAddress}"`
  };

  filesToUpdate.forEach(filePath => {
    let fileContent = fs.readFileSync(filePath, 'utf-8');
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(key, 'g');
      fileContent = fileContent.replace(regex, value);
    }
    fs.writeFileSync(filePath, fileContent, 'utf-8');
  });
}

async function pushChangesToGitHub(index, casterName, raffleAddress) {
  try {
    const repoPath = path.join('/tmp', 'SummerLuck');

    // Remove the existing directory if it exists
    await rm(repoPath, { recursive: true, force: true });
    console.log('Removed existing directory:', repoPath);

    // Clone the repository
    await git.clone({
      fs,
      http,
      dir: repoPath,
      url: 'https://github.com/oguzutku1745/SummerLuck.git',
      singleBranch: true,
      depth: 1,
    });
    console.log('Repository cloned successfully');

    const newCustomDir = path.join(repoPath, `app/customized/custom-${index}`);

    // Duplicate the custom-1 directory by renaming it as custom-n
    await fs.copy(customTemplateDir, newCustomDir);

    // Apply new environment variables to custom-n directory
    await updateCustomFiles(newCustomDir, index, casterName, raffleAddress);

    // Commit and push the changes
    await git.add({ fs, dir: repoPath, filepath: '.' });
    await git.commit({
      fs,
      dir: repoPath,
      author: {
        name: 'github-actions[bot]',
        email: 'github-actions[bot]@users.noreply.github.com',
      },
      message: `Add custom raffle ${index}`,
    });
    await git.push({
      fs,
      http,
      dir: repoPath,
      remote: 'origin',
      ref: 'main',
      onAuth: () => ({ username: process.env.GITHUB_TOKEN }),
    });

    console.log(`Custom raffle created and pushed to GitHub successfully at: custom-${index}`);
  } catch (error) {
    console.error('Error pushing changes to GitHub:', error);
    throw error;
  }
}

async function createCustomRaffle(casterName, raffleAddress) {
  try {
    // Find the next custom index
    const index = await findNextIndex();
    const customRaffleUrl = `https://summer-luck.vercel.app/customized/custom-${index}`;
    // Push the changes to GitHub
    await pushChangesToGitHub(index, casterName, raffleAddress);
    return customRaffleUrl;
  } catch (error) {
    console.error('Error creating custom raffle:', error);
    throw error;
  }
}

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

      // Create the custom raffle
      const customRaffleUrl = await createCustomRaffle(casterName, raffleAddress);

      // Send the custom raffle URL in the response
      res.status(200).json({ message: 'Raffle created and GitHub Action triggered successfully', url: customRaffleUrl });
    } catch (error) {
      console.error('Error creating custom raffle:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    console.log('Method not allowed');
    res.status(405).json({ error: 'Method not allowed' });
  }
}