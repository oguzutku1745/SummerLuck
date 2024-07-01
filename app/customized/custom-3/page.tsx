import React from 'react';
import { fetchMetadata } from "frames.js/next";

export async function generateMetadata() {
  return {
    title: "My Page",
    // provide a full URL to your /frames endpoint
    other: await fetchMetadata(
      new URL(
        "/frames",
        "https://summer-luck.vercel.app/customized/custom-3"
          ? `https://${"summer-luck.vercel.app/customized/custom-3"}`
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
