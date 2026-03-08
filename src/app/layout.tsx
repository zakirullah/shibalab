import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShibaLab Mining Platform - Daily 2% Returns | SHIB Staking",
  description: "The ultimate cloud ShibaLab mining platform. Earn daily 2% returns on your staked SHIB tokens. Start your crypto mining journey with ShibaLab today!",
  keywords: ["ShibaLab", "SHIB", "Shiba Inu", "crypto mining", "staking", "cryptocurrency", "daily returns", "passive income"],
  authors: [{ name: "ShibaLab Team" }],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "ShibaLab Mining Platform",
    description: "Daily 2% returns on SHIB staking. Join the $8 Billion industry!",
    url: "https://shibalab.io",
    siteName: "ShibaLab",
    type: "website",
    images: ["/shiba-mascot.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShibaLab Mining Platform",
    description: "Daily 2% returns on SHIB staking. Start mining now!",
    images: ["/shiba-mascot.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
