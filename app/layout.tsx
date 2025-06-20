import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "Momentum AI - Your AI Accountability Agent",
  description: "Stay emotionally connected to your goals with AI-powered accountability. Momentum AI predicts when you'll drift and intervenes proactively.",
  keywords: "AI, accountability, goals, productivity, habits, coaching, motivation",
  authors: [{ name: "Momentum AI Team" }],
  creator: "Momentum AI",
  publisher: "Momentum AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/images/momentum-logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: [
      { url: '/images/momentum-logo.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
  },
  openGraph: {
    title: "Momentum AI - Your AI Accountability Agent",
    description: "Stay emotionally connected to your goals with AI-powered accountability.",
    url: "https://momentum-ai.com",
    siteName: "Momentum AI",
    images: [
      {
        url: "/images/momentum-logo.svg",
        width: 1200,
        height: 630,
        alt: "Momentum AI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Momentum AI - Your AI Accountability Agent",
    description: "Stay emotionally connected to your goals with AI-powered accountability.",
    images: ["/images/momentum-logo.svg"],
    creator: "@momentum_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/momentum-logo.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/momentum-logo.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Momentum AI" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
