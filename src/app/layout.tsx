// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Import the font
import "./globals.css";

// 2. Initialize the font with the settings we want
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // Bonus: I've updated your page title and description
  title: "AI Website Builder",
  description: "Generate stunning websites with the power of AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Apply the font's generated className to the entire body */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}