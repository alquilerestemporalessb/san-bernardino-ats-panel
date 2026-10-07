/**
 * URL base del sitio para links absolutos (metadataBase, canonical, sitemap, robots, JSON-LD,
 * Open Graph/Twitter).
 *
 * Se lee de NEXT_PUBLIC_SITE_URL (asi se puede apuntar a localhost en desarrollo sin tocar
 * codigo); sin esa variable cae al dominio de produccion.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alquilersanbernardino.com.py";

export function getSiteUrl(): string {
  return SITE_URL;
}
