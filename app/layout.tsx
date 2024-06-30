import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialImageUrl = `${process.env.APP_URL}/entrance.png`;

  return (
    <html lang="en">
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={initialImageUrl} />
        <meta property="og:image" content={initialImageUrl} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
