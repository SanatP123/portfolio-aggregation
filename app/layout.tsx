import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const adsenseClient = "ca-pub-1496544894534044";

export const metadata: Metadata = {
  title: "Portfolio Aggregation",
  description: "An elegant dashboard for tracking portfolio value and activity.",
  other: {
    "google-adsense-account": adsenseClient,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
