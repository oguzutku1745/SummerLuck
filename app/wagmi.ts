let config;

async function loadConfig() {
  try {
    const { getDefaultConfig } = await import('@rainbow-me/rainbowkit');
    const { baseSepolia } = await import('wagmi/chains');

    config = getDefaultConfig({
      appName: 'LuckySummer',
      projectId: 'eb2cab69c2c3b69c06a515ffdf5299d1',
      chains: [
        baseSepolia
      ],
      ssr: true,
    });

    console.log('Configuration loaded successfully:', config);
  } catch (error) {
    console.error('Error loading modules:', error);
  }
}

// Call the function to load the configuration
loadConfig().then(() => {
  // Now you can use config after it has been loaded
  console.log('Config is ready to be used:', config);
});

// Example of using the config later
export function getConfig() {
  if (!config) {
    throw new Error('Config has not been loaded yet');
  }
  return config;
}

export {config};