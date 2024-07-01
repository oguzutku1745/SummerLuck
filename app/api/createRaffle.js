import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import path from 'path';
import simpleGit from 'simple-git';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { casterName, raffleAddress } = req.body;

    if (!casterName || !raffleAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Write SSH key to file
      const sshKeyPath = path.join('/tmp', 'id_ed25519');
      await writeFile(sshKeyPath, process.env.SSH_PRIVATE_KEY);
      await execAsync(`chmod 600 ${sshKeyPath}`);

      // Setup SSH agent
      const sshAgentOutput = await execAsync('ssh-agent -s');
      const sshAgentPid = sshAgentOutput.stdout.match(/SSH_AGENT_PID=(\d+)/)[1];
      process.env.SSH_AGENT_PID = sshAgentPid;

      await execAsync(`ssh-add ${sshKeyPath}`);

      // Initialize simple-git with the correct directory
      const git = simpleGit('/tmp');

      // Clone the repository
      await git.clone('git@github.com:oguzutku1745/SummerLuck.git');

      const repoPath = path.join('/tmp', 'Summerluck');

      // Modify the .env file in the cloned repository
      const envFilePath = path.join(repoPath, '.env');
      let envContent = await fs.promises.readFile(envFilePath, 'utf-8');
      const currentIndex = (envContent.match(/APP_URL_/g) || []).length + 1;
      envContent += `
APP_URL_${currentIndex}="http://summer-luck.vercel.app/customized/custom-${currentIndex}"
RAFFLE_ADDRESS_${currentIndex}=${raffleAddress}
FARCASTER_NAME_${currentIndex}="${casterName}"
`;
      await fs.promises.writeFile(envFilePath, envContent);

      // Commit and push the changes
      await git.addConfig('user.name', 'github-actions[bot]', undefined, { cwd: repoPath });
      await git.addConfig('user.email', 'github-actions[bot]@users.noreply.github.com', undefined, { cwd: repoPath });
      await git.add(['.env'], { cwd: repoPath });
      await git.commit(`Add custom raffle ${currentIndex}`, undefined, undefined, { cwd: repoPath });
      await git.push('origin', 'main', undefined, { cwd: repoPath });

      res.status(200).json({ message: 'Raffle created and pushed to GitHub successfully' });
    } catch (error) {
      console.error('Error creating custom raffle:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
