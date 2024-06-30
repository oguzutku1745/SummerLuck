import React, { useState } from 'react';
import { ethers } from 'ethers';

interface ConnectWalletProps {
  onConnect: (account: string) => void;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect }) => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const userAccount = accounts[0];
        setAccount(userAccount);
        onConnect(userAccount);
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask and try again.');
    }
  };

  return (
    <div style={{ border:"2px solid white", borderRadius:"5px", padding:"10px", backgroundColor:"#fff" }}>
      {account ? (
        <div>
          <p>Connected account: {account}</p>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default ConnectWallet;
