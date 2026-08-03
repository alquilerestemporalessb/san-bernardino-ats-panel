import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";

export default async function AvailabilityPage(
  props: PageProps<"/admin/properties/[id]/availability">
) {
  const { id } = await props.params;

  const supabase = await createClient();
  const [{ data: property }, { data: blockedDates }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).single(),
    supabase.from("property_blocked_dates").select("date").eq("property_id", id),
  ]);

  if (!property) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link href="/admin" className="text-xs text-sb-cream-faint hover:text-sb-cream-muted">
          ← Volver al listado
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-sb-cream">Disponibilidad</h1>
        <p className="text-sm text-sb-cream-muted">
          {property.code} — {property.name}
        </p>
      </div>

      <AvailabilityCalendar
        propertyId={property.id}
        initialBlockedDates={(blockedDates ?? []).map((b) => b.date)}
      />
    </div>
  );
}
