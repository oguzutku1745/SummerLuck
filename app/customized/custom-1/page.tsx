import React from 'react';
import { fetchMetadata } from "frames.js/next";

export async function generateMetadata() {
  return {
    title: "My Page",
    // provide a full URL to your /frames endpoint
    other: await fetchMetadata(
      new URL(
        "/frames",
        process.env.APP_URL_1
          ? `https://${process.env.VERCEL_URL_1}`
          : "http://localhost:3000"
      )
    ),
  };
}

export default function Page() {
    return (
        <div style={{ backgroundColor: "darkcyan", width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Visit <a href="https://summer-luck.vercel.app">main app</a> to create your own mint!
        </div>
    );
}
