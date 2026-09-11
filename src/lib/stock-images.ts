/**
 * Imagenes decorativas del sitio publico (Hero, secciones de marca) — NUNCA se usan para
 * propiedades reales, esas siempre vienen de Supabase Storage (fotos que carga el equipo ATS).
 * Fuente: Unsplash, hotlink directo via images.unsplash.com (sin API key, uso estandar).
 * Helper `unsplash(id, width)` arma la URL con los parametros de optimizacion consistentes.
 */
function unsplash(photoId: string, width: number) {
  return `https://images.unsplash.com/photo-${photoId}?q=80&w=${width}&auto=format&fit=crop`;
}

export const STOCK_IMAGES = {
  // Hero: casa moderna al atardecer (imagen principal, grande) + living calido (secundaria, collage).
  heroMain: unsplash("1600585154340-be6161a56a0c", 1400),
  heroSecondary: unsplash("1600210492486-724fe5c67fb0", 700),
  // Confianza: living luminoso con pileta de fondo.
  trust: unsplash("1600566753086-00f18fb6b3ea", 900),
  // Propietarios: villa blanca con pileta, de dia.
  owners: unsplash("1613977257363-707ba9348227", 1100),
  // Franja "por que San Ber": lago en calma rodeado de verde.
  lake: unsplash("1439066615861-d1af74d74000", 1400),
} as const;
