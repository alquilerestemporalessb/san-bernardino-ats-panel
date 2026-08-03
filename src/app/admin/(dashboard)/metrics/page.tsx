import { createClient } from "@/lib/supabase/server";

interface PropertyStats {
  code: string;
  name: string;
  views: number;
  whatsappClicks: number;
}

async function getStats(): Promise<PropertyStats[]> {
  const supabase = await createClient();

  const [{ data: properties }, { data: events }] = await Promise.all([
    supabase.from("properties").select("id, code, name"),
    supabase
      .from("property_events")
      .select("property_id, event_type")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const countsByProperty = new Map<string, { views: number; whatsappClicks: number }>();
  for (const event of events ?? []) {
    const entry = countsByProperty.get(event.property_id) ?? { views: 0, whatsappClicks: 0 };
    if (event.event_type === "view") entry.views += 1;
    else entry.whatsappClicks += 1;
    countsByProperty.set(event.property_id, entry);
  }

  return (properties ?? [])
    .map((property) => {
      const counts = countsByProperty.get(property.id) ?? { views: 0, whatsappClicks: 0 };
      return { code: property.code, name: property.name, ...counts };
    })
    .sort((a, b) => b.whatsappClicks - a.whatsappClicks || b.views - a.views);
}

function Bar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const widthPct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 4 : 0) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-sb-bg">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${widthPct}%` }} />
    </div>
  );
}

export default async function MetricsPage() {
  const stats = await getStats();
  const maxViews = Math.max(0, ...stats.map((s) => s.views));
  const maxClicks = Math.max(0, ...stats.map((s) => s.whatsappClicks));
  const totalViews = stats.reduce((sum, s) => sum + s.views, 0);
  const totalClicks = stats.reduce((sum, s) => sum + s.whatsappClicks, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl text-sb-cream">Métricas</h1>
        <p className="text-sm text-sb-cream-muted">Últimos 30 días — ordenado por consultas de WhatsApp.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="rounded-lg border border-sb-border-subtle bg-sb-bg-elevated px-5 py-4">
          <p className="text-2xl font-serif text-sb-cream">{totalViews}</p>
          <p className="text-xs text-sb-cream-muted">Vistas de propiedades</p>
        </div>
        <div className="rounded-lg border border-sb-border-subtle bg-sb-bg-elevated px-5 py-4">
          <p className="text-2xl font-serif text-sb-cream">{totalClicks}</p>
          <p className="text-xs text-sb-cream-muted">Consultas por WhatsApp</p>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="rounded-lg border border-sb-border-subtle bg-sb-bg-elevated px-6 py-10 text-center">
          <p className="text-sm text-sb-cream-muted">Todavía no hay propiedades cargadas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sb-border-subtle">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-sb-border-subtle bg-sb-bg-elevated text-left text-xs uppercase tracking-wider text-sb-cream-faint">
                <th className="px-4 py-3 font-medium">Propiedad</th>
                <th className="px-4 py-3 font-medium">Vistas</th>
                <th className="px-4 py-3 font-medium">Consultas WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.code} className="border-b border-sb-border-subtle last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium text-sb-cream">{stat.code}</span>
                    <span className="ml-2 text-sb-cream-muted">{stat.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 shrink-0 text-sb-cream-muted">{stat.views}</span>
                      <Bar value={stat.views} max={maxViews} colorClass="bg-sb-cream-faint" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 shrink-0 text-sb-cream-muted">{stat.whatsappClicks}</span>
                      <Bar value={stat.whatsappClicks} max={maxClicks} colorClass="bg-sb-accent" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
