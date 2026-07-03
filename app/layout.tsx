import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import Navbar from "@/components/Navbar";
import { MusicPlayer } from "@/components/MusicPlayer";


const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Vibify - Stream Your Rhythm',
    template: '%s | Vibify',
  },
  description: 'Experience music like never before. Vibify is a high-fidelity, lightning-fast music streaming application built for ultimate late-night grooves and personalized playlists.',
  keywords: ['Music streaming', 'Vibify', 'NextJS music app', 'Playlists', 'Hi-Fi audio', 'Tailwind CSS music player'],
  authors: [{ name: 'Vibify Team' }],
  creator: 'Vibify',
  publisher: 'Vibify',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],


  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vibify.vercel.app', // Swap with your actual URL later
    siteName: 'Vibify',
    title: 'Vibify - Your Music, Perfectly Tuned',
    description: 'Immerse yourself in a sleek, dark-mode audio ecosystem. Stream, curate, and discover your next favorite track with zero friction.',
    images: [
      {
        url: 'https://vibify.vercel.app/og-image.png', // Create a cool screenshot/logo for this path
        width: 1200,
        height: 630,
        alt: 'Vibify Music Player Dashboard preview',
      },
    ],
  },

  // Twitter/X Cards
  twitter: {
    card: 'summary_large_image',
    title: 'Vibify - Stream Your Rhythm',
    description: 'A premium, ultra-fast music streaming app built with Next.js and Tailwind CSS.',
    creator: '@vibify_app', // Swap with your handle if you make one
    images: ['https://vibify.vercel.app/og-image.png'],
  },


};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Wrap everything inside the body with your provider */}
        <ThemeProvider>
          <MusicPlayerProvider>
            <Navbar />
            {children}
            <MusicPlayer />
          </MusicPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}