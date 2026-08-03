/**
 * URL base del sitio para links absolutos (metadataBase, sitemap, robots, JSON-LD).
 *
 * VERCEL_PROJECT_PRODUCTION_URL la expone Vercel solo, sin configurar nada — apunta siempre
 * al dominio de produccion vigente (si algun dia se agrega un dominio propio, se actualiza sola).
 * En local (sin esa env var) cae a localhost.
 */
export function getSiteUrl(): string {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000";
}
