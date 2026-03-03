import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShibaLab Mining Platform | 140% Return in 30 Days | SHIB Mining",
  description: "ShibaLab - Professional SHIB mining platform. Get 140% total return in 30 days (40% profit). Start mining Shiba Inu coins today with packages from 100K to 5M SHIB. BSC Network.",
  keywords: [
    "ShibaLab",
    "SHIB mining",
    "Shiba Inu mining",
    "SHIB staking",
    "crypto mining",
    "cryptocurrency investment",
    "Shiba Inu coin",
    "BSC mining",
    "passive income crypto",
    "SHIB investment",
    "doge coin alternative",
    "crypto returns",
    "mining platform",
    "140% returns",
    "SHIB profit"
  ],
  authors: [{ name: "ShibaLab Team" }],
  creator: "ShibaLab",
  publisher: "ShibaLab",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "ShibaLab Mining Platform - 140% Return in 30 Days",
    description: "Professional SHIB mining platform. Get 140% total return (40% profit) in 30 days. Packages from 100K to 5M SHIB. Start earning now!",
    url: "https://shibalab-weld.vercel.app",
    siteName: "ShibaLab Mining Platform",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "ShibaLab Mining Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShibaLab Mining Platform - 140% Return",
    description: "Get 140% total return in 30 days. Professional SHIB mining platform on BSC Network.",
    images: ["/favicon.png"],
    creator: "@shibalab",
  },
  alternates: {
    canonical: "https://shibalab-weld.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="cuKdYprJvxrNBeAZwCl-YtyESO8dsEYVC8YMjxRI2hg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
