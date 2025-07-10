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
  title: 'Momentum AI - AI-Powered Habit & Goal Coaching',
  description: 'Transform your life with AI-powered coaching, habit tracking, and personalized insights. Build lasting momentum towards your goals.',
  keywords: ['AI coaching', 'habit tracking', 'goal setting', 'personal development', 'productivity'],
  authors: [{ name: 'Momentum AI Team' }],
  creator: 'Momentum AI',
  publisher: 'Momentum AI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://momentum-ai.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  icons: {
    icon: [
      { url: '/images/favicon.png', type: 'image/png' },
      { url: '/images/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/images/icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/images/icon.png',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Momentum AI - AI-Powered Habit & Goal Coaching',
    description: 'Transform your life with AI-powered coaching, habit tracking, and personalized insights.',
    siteName: 'Momentum AI',
    images: ["/images/icons/icon.png"],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Momentum AI - AI-Powered Habit & Goal Coaching',
    description: 'Transform your life with AI-powered coaching, habit tracking, and personalized insights.',
    images: ["/images/icons/icon.png"],
    creator: '@momentum_ai',
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
  verification: {
    google: 'your-google-verification-code',
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
        <link rel="icon" href="/images/favicon.png" type="image/png" />
        <link rel="alternate icon" href="/images/icon.png" />
        <link rel="apple-touch-icon" href="/images/icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff6b35" />
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
