import { createAnonClient } from "@/lib/supabase/anon";

const VALID_EVENT_TYPES = new Set(["view", "whatsapp_click"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const { property_id, event_type } = (body ?? {}) as {
    property_id?: unknown;
    event_type?: unknown;
  };

  if (
    typeof property_id !== "string" ||
    typeof event_type !== "string" ||
    !VALID_EVENT_TYPES.has(event_type)
  ) {
    return new Response(null, { status: 400 });
  }

  try {
    const supabase = createAnonClient();
    await supabase.from("property_events").insert({
      property_id,
      event_type: event_type as "view" | "whatsapp_click",
    });
  } catch (err) {
    console.error("[api/events] fallo al registrar evento:", err);
  }

  // 204 sin cuerpo: es un beacon de tracking, no hace falta que el cliente lea nada.
  return new Response(null, { status: 204 });
}
