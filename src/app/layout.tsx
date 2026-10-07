import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({src: [
  {path: "../../public/fonts/satoshi-regular.woff2", weight: "400"},
  {path: "../../public/fonts/satoshi-medium.woff2", weight: "500"},
  {path: "../../public/fonts/satoshi-bold.woff2", weight: "700"},
], variable: "--font-satoshi", display: "swap"});
const display = localFont({src: "../../public/fonts/staatliches.ttf", variable: "--font-display", display: "swap"});
const editorial = localFont({src: "../../public/fonts/stint-ultra-condensed.ttf", variable: "--font-editorial", display: "swap"});

export const metadata: Metadata = {
  title: "UKOS — Personal Operating System for UK Student Life",
  description: "Manage your education loan repayment, convert GBP to INR live, track university notes, schedule visa appointments and part-time shifts, log expenses, and get AI budget insights.",
};

import { AppShell } from "@/components/dashboard/AppShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${display.variable} ${editorial.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
