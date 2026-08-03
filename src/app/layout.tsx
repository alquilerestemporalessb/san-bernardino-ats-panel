import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const title = "San Bernardino — Alquileres Temporales";
const description =
  "Alquiler temporal de casas en San Bernardino, Paraguay. Propiedades verificadas, atención directa por WhatsApp, sin sorpresas.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: title,
    template: "%s · San Bernardino ATS",
  },
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "es_PY",
    images: ["/isotype.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-sb-bg text-sb-cream antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
