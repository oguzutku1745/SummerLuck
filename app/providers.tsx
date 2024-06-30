'use client';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi';

const queryClient = new QueryClient();

const Providers = ({ children }) => {
  const [WagmiProvider, setWagmiProvider] = useState(null);
  const [RainbowKitProvider, setRainbowKitProvider] = useState(null);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const wagmiModule = await import('wagmi');
        const rainbowKitModule = await import('@rainbow-me/rainbowkit');
        
        setWagmiProvider(() => wagmiModule.WagmiProvider);
        setRainbowKitProvider(() => rainbowKitModule.RainbowKitProvider);
      } catch (error) {
        console.error('Error loading modules:', error);
      }
    };

    loadModules();
  }, []);

  if (!WagmiProvider || !RainbowKitProvider) {
    return <div>Loading...</div>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Providers;
