import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gorunrabbit.com"),
  title: {
    default: "Go Run Rabbit — Event Production & Hospitality Technology",
    template: "%s | Go Run Rabbit",
  },
  description: "Event production, sponsorship platforms, and operations software for hospitality and live events. Las Vegas.",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  openGraph: {
    type: "website",
    siteName: "Go Run Rabbit",
    title: "Go Run Rabbit — Event Production & Hospitality Technology",
    description: "Event production + custom software for hospitality and live events.",
    images: ["/og-image.png"],
    url: "https://gorunrabbit.com",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://gorunrabbit.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
