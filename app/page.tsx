import React from 'react';
import { fetchMetadata } from "frames.js/next";
import CreateRaffle from "./components/create-raffle";
import '@rainbow-me/rainbowkit/styles.css';
import ConnectWallet from './components/ConnectWallet';

export async function generateMetadata() {
  return {
    title: "My Page",
    // provide a full URL to your /frames endpoint
    other: await fetchMetadata(
      new URL(
        "/frames",
        process.env.APP_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"
      )
    ),
  };
}

export default function Page() {
  return (
    <div style={{ backgroundColor:"darkcyan", width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CreateRaffle />
    </div>
  );
}
