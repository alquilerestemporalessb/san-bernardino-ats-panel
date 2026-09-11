/**
 * El equipo carga la descripcion de cada propiedad como texto libre con una convencion propia:
 * titulo + datos rapidos + bajada con emojis, despues un divisor (━━━) y secciones tipo
 * "📍 UBICACION" / "🏡 ESPACIOS INTERIORES" con lineas en texto plano o separadas por "|" o
 * prefijadas con "✓". Este parser limpia esa "sopa de emojis" y arma bloques prolijos — sin
 * inventar contenido: solo reestructura lo que el equipo ya escribio.
 *
 * El titulo y los datos rapidos (primeras 2 lineas) se descartan porque ya se muestran aparte
 * (nombre en el <h1>, capacidad/zona/dormitorios en AmenitiesGrid) — mostrarlos de nuevo aca
 * seria redundante.
 */

export type DescriptionBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export interface DescriptionSection {
  /** null = bloque introductorio, antes de cualquier encabezado — se muestra como "Sobre esta propiedad". */
  heading: string | null;
  blocks: DescriptionBlock[];
}

const EMOJI_RE =
  /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}️]/gu;

const BULLET_RE = /^[✓✔•\-]\s*/;
const DIVIDER_RE = /[━─]{4,}/;
const PRICE_LINE_RE = /consultar precio|Gs\.\s?[\d.,]+|superanfiti?ri[oó]n|★|⭐/i;

function stripEmoji(text: string): string {
  return text
    .replace(EMOJI_RE, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function toSentenceCase(text: string): string {
  const lower = text.toLowerCase();
  return lower ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
}

function splitBlocks(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
}

export function parseDescription(raw: string | null | undefined): DescriptionSection[] {
  if (!raw) return [];
  const normalized = raw.replace(/\r\n/g, "\n");
  const [preamble, ...rest] = normalized.split(DIVIDER_RE);
  const structured = rest.join("\n");

  const sections: DescriptionSection[] = [];

  // Bajada introductoria: se descartan el titulo y los datos rapidos (bloques 0 y 1) y
  // cualquier bloque que sea solo precio/rating — el resto se muestra tal cual, linea por linea.
  const introLines = splitBlocks(preamble)
    .slice(2)
    .filter((block) => !PRICE_LINE_RE.test(block))
    .flatMap((block) => block.split("\n"))
    .map(stripEmoji)
    .filter(Boolean);

  if (introLines.length > 0) {
    sections.push({ heading: null, blocks: introLines.map((text) => ({ kind: "p", text })) });
  }

  // Secciones estructuradas: primera linea de cada bloque es el encabezado, el resto es
  // contenido (parrafo, o lista si hay "|" o si la linea original empezaba con ✓/•/-).
  for (const block of splitBlocks(structured)) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const heading = toSentenceCase(stripEmoji(lines[0]));
    if (!heading) continue;

    const blocks: DescriptionBlock[] = [];
    let bulletAcc: string[] = [];
    const flushBullets = () => {
      if (bulletAcc.length > 0) {
        blocks.push({ kind: "ul", items: bulletAcc });
        bulletAcc = [];
      }
    };

    for (const line of lines.slice(1)) {
      if (line.includes(" | ")) {
        flushBullets();
        const items = line
          .split(" | ")
          .map((item) => stripEmoji(item.replace(BULLET_RE, "")))
          .filter(Boolean);
        if (items.length > 0) blocks.push({ kind: "ul", items });
      } else if (BULLET_RE.test(line)) {
        const item = stripEmoji(line.replace(BULLET_RE, ""));
        if (item) bulletAcc.push(item);
      } else {
        flushBullets();
        const text = stripEmoji(line);
        if (text) blocks.push({ kind: "p", text });
      }
    }
    flushBullets();

    if (blocks.length > 0) sections.push({ heading, blocks });
  }

  return sections;
}
