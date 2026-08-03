import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // property.photo_url es una URL pegada a mano por el equipo ATS (todavia no hay upload propio,
    // ver README) — puede venir de cualquier dominio, asi que se permite cualquier host https.
    // Si mas adelante se suma Supabase Storage para las fotos, esto se puede acotar al dominio del bucket.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
