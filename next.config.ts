import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las fotos se suben a Supabase Storage, pero se permite cualquier host https por si en algun
    // momento se carga una imagen externa a mano (ej. tour_url no pasa por next/image, pero por
    // las dudas se deja abierto en vez de acotar a un solo dominio).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
