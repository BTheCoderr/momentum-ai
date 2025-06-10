import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Momentum AI - Your AI Accountability Agent",
  description: "Stay emotionally connected to your goals with AI-powered accountability. Daily check-ins, streak tracking, and personalized coaching to help you achieve what matters most.",
  keywords: "goal tracking, accountability, AI coach, habit tracking, motivation, personal development",
  authors: [{ name: "Momentum AI" }],
  openGraph: {
    title: "Momentum AI - Your AI Accountability Agent",
    description: "AI-powered goal tracking with daily check-ins, streak tracking, and personalized coaching",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Momentum AI - Your AI Accountability Agent", 
    description: "AI-powered goal tracking with daily check-ins, streak tracking, and personalized coaching",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
