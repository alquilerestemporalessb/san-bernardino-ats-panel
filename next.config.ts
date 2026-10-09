import type { NextConfig } from "next";

const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;

const nextConfig: NextConfig = {
  images: {
    // Las fotos se suben a Supabase Storage; las de stock vienen de Unsplash (ver stock-images.ts).
    // Lista cerrada en vez de hostname "**" para no permitir optimizar imagenes de cualquier host.
    remotePatterns: [
      { protocol: "https", hostname: supabaseHostname },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
