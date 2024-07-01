const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const customDirPath = path.join(__dirname, 'app/customized');
const envFilePath = path.join(__dirname, '.env');
const customTemplateDir = path.join(customDirPath, 'custom-1');

const createCustomRaffle = async (casterName, raffleAddress) => {
  try {
    // 1. Add new .env variables
    const envContent = fs.readFileSync(envFilePath, 'utf-8');
    const currentIndex = (envContent.match(/APP_URL_/g) || []).length + 1;

    const newEnvContent = `
APP_URL_${currentIndex}="http://summer-luck.vercel.app/customized/custom-${currentIndex}"
VERCEL_URL_${currentIndex}="summer-luck.vercel.app/customized/custom-${currentIndex}"
RAFFLE_ADDRESS_${currentIndex}=${raffleAddress}
FARCASTER_NAME_${currentIndex}="${casterName}"
`;
    fs.appendFileSync(envFilePath, newEnvContent);

    // 2. Duplicate the custom-1 directory by renaming it as custom-n
    const newCustomDir = path.join(customDirPath, `custom-${currentIndex}`);
    await fs.copy(customTemplateDir, newCustomDir);

    // 3. Apply new environment variables to custom-n directory
    const filesToUpdate = [
      path.join(newCustomDir, 'frames/frames.ts'),
      path.join(newCustomDir, 'page.tsx'),
      path.join(newCustomDir, 'frames/route.tsx'),
      path.join(newCustomDir, 'frames/txdata/route.ts'),
    ];

    filesToUpdate.forEach((filePath) => {
      let fileContent = fs.readFileSync(filePath, 'utf-8');
      fileContent = fileContent.replace(/custom-1/g, `custom-${currentIndex}`)
                                .replace(/APP_URL_1/g, `APP_URL_${currentIndex}`)
                                .replace(/VERCEL_URL_1/g, `APP_URL_${currentIndex}`)
                                .replace(/FARCASTER_NAME_1/g, `FARCASTER_NAME_${currentIndex}`)
                                .replace(/RAFFLE_ADDRESS_1/g, `RAFFLE_ADDRESS_${currentIndex}`);
      fs.writeFileSync(filePath, fileContent, 'utf-8');
    });

    console.log(`Custom raffle created successfully at: ${newCustomDir}`);
  } catch (error) {
    console.error('Error creating custom raffle:', error);
  }
};

// Get arguments from the command line
const [casterName, raffleAddress] = process.argv.slice(2);
if (!casterName || !raffleAddress) {
  console.error('Usage: node createCustomRaffle.js <casterName> <raffleAddress>');
  process.exit(1);
}

createCustomRaffle(casterName, raffleAddress);
