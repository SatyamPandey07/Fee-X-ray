import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Fee X-ray — Stop Losing Money to Hidden Fees",
    template: "%s | Fee X-ray",
  },
  description:
    "Fee X-ray automatically finds money your small business is losing to bank fees, processor rates, and zombie subscriptions. Connect your accounts and start saving in minutes.",
  keywords: ["fee analysis", "small business", "bank fees", "payment processor", "savings"],
  openGraph: {
    title: "Fee X-ray — Stop Losing Money to Hidden Fees",
    description:
      "Connect your bank and payment accounts. Fee X-ray automatically finds hidden charges and tells you exactly how to stop them.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fee X-ray — Stop Losing Money to Hidden Fees",
    description: "Automatically find and fix hidden fees eating into your business revenue.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
