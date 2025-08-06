// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // 1. Import our new Providers component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Website Builder",
  description: "Generate stunning websites with the power of AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. Add suppressHydrationWarning to the <html> tag
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 3. Wrap the children with the Providers component */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}