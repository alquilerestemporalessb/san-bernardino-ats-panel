import { createAnonClient } from "@/lib/supabase/anon";

const VALID_EVENT_TYPES = new Set(["view", "whatsapp_click"]);
const VALID_MODALITIES = new Set(["bloque", "fin_de_semana", "noche", "custom"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Limite de frecuencia simple en memoria: por IP, ventana deslizante. No persiste datos
// personales — el Map vive solo en el proceso y se pierde en cada reinicio/instancia.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return new Response(null, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const { property_id, event_type, modality, total_gs } = (body ?? {}) as {
    property_id?: unknown;
    event_type?: unknown;
    modality?: unknown;
    total_gs?: unknown;
  };

  if (
    typeof property_id !== "string" ||
    !UUID_RE.test(property_id) ||
    typeof event_type !== "string" ||
    !VALID_EVENT_TYPES.has(event_type)
  ) {
    return new Response(null, { status: 400 });
  }

  if (modality !== undefined && (typeof modality !== "string" || !VALID_MODALITIES.has(modality))) {
    return new Response(null, { status: 400 });
  }
  if (total_gs !== undefined && (typeof total_gs !== "number" || !Number.isFinite(total_gs) || total_gs <= 0)) {
    return new Response(null, { status: 400 });
  }

  try {
    const supabase = createAnonClient();
    await supabase.from("property_events").insert({
      property_id,
      event_type: event_type as "view" | "whatsapp_click",
      modality: (modality as string | undefined) ?? null,
      total_gs: (total_gs as number | undefined) ?? null,
    });
  } catch (err) {
    console.error("[api/events] fallo al registrar evento:", err);
  }

  // 204 sin cuerpo: es un beacon de tracking, no hace falta que el cliente lea nada.
  return new Response(null, { status: 204 });
}
