import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, rm } from 'fs/promises';
import path from 'path';
import fs from 'fs-extra';
import simpleGit from 'simple-git';
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
    'process.env.APP_URL': `"http://summer-luck.vercel.app/customized/custom-${index}"`,
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

    // Initialize simple-git with the correct directory
    const git = simpleGit();

    // Clone the repository
    await git.clone('git@github.com:oguzutku1745/SummerLuck.git', repoPath);
    console.log('Repository cloned successfully');

    const newCustomDir = path.join(repoPath, `app/customized/custom-${index}`);

    // Duplicate the custom-1 directory by renaming it as custom-n
    await fs.copy(customTemplateDir, newCustomDir);

    // Apply new environment variables to custom-n directory
    await updateCustomFiles(newCustomDir, index, casterName, raffleAddress);

    // Initialize simple-git in the cloned repository directory
    const repoGit = simpleGit(repoPath);

    // Commit and push the changes
    await repoGit.addConfig('user.name', 'github-actions[bot]');
    await repoGit.addConfig('user.email', 'github-actions[bot]@users.noreply.github.com');
    await repoGit.add(newCustomDir);
    await repoGit.commit(`Add custom raffle ${index}`);
    await repoGit.push('origin', 'main');

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

    // Push the changes to GitHub
    await pushChangesToGitHub(index, casterName, raffleAddress);

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
      await createCustomRaffle(casterName, raffleAddress);

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
