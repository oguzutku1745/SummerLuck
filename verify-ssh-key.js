import { readFile } from 'fs/promises';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function verifySSHKey() {
  try {
    // Read the SSH key from the environment variable
    const envSSHKeyContent = process.env.SSH_PRIVATE_KEY;

    // Write the env SSH key to a temporary file
    const tempEnvKeyPath = path.join('/tmp', 'env_id_ed25519');
    await writeFile(tempEnvKeyPath, envSSHKeyContent);

    // Path to the SSH key in the specified directory
    const sshKeyPath = '/Users/ouyildiz/Documents/.ssh';
    const sshKeyContent = await readFile(sshKeyPath, 'utf-8');

    // Compare the two keys
    if (envSSHKeyContent === sshKeyContent) {
      console.log('The SSH keys are identical.');
    } else {
      console.log('The SSH keys are different.');
      console.log('SSH Key from .env:', envSSHKeyContent);
      console.log('SSH Key from .ssh:', sshKeyContent);
    }

    // Clean up the temporary file
    await unlink(tempEnvKeyPath);
  } catch (error) {
    console.error('Error verifying SSH keys:', error);
  }
}

verifySSHKey();
