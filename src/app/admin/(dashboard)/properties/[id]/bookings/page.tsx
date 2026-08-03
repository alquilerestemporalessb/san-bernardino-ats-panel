import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingForm } from "@/components/BookingForm";
import { CancelBookingButton } from "@/components/CancelBookingButton";
import { formatDateEs } from "@/lib/dates";
import { formatGs } from "@/lib/currency";

export default async function PropertyBookingsPage(
  props: PageProps<"/admin/properties/[id]/bookings">
) {
  const { id } = await props.params;

  const supabase = await createClient();
  const [{ data: property }, { data: blockedDates }, { data: bookings }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).single(),
    supabase.from("property_blocked_dates").select("date").eq("property_id", id),
    supabase
      .from("property_bookings")
      .select("*")
      .eq("property_id", id)
      .order("check_in", { ascending: false }),
  ]);

  if (!property) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <Link href="/admin" className="text-xs text-sb-cream-faint hover:text-sb-cream-muted">
          ← Volver al listado
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-sb-cream">Reservas</h1>
        <p className="text-sm text-sb-cream-muted">
          {property.code} — {property.name}
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-sb-cream-muted">Registrar reserva</h2>
        <BookingForm
          propertyId={property.id}
          blockedDates={(blockedDates ?? []).map((b) => b.date)}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-sb-cream-muted">Reservas cargadas</h2>
        {!bookings || bookings.length === 0 ? (
          <p className="text-sm text-sb-cream-faint">Todavia no hay reservas para esta propiedad.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {bookings.map((booking) => {
              const commission = (booking.amount * booking.commission_pct) / 100;
              const cancelled = booking.status === "cancelada";
              return (
                <li
                  key={booking.id}
                  className={`rounded-md border border-sb-border-subtle px-4 py-3 text-sm ${
                    cancelled ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-sb-cream">{booking.guest_name}</span>
                    <span className="text-xs text-sb-cream-faint">
                      {formatDateEs(booking.check_in)} — {formatDateEs(booking.check_out)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sb-cream-muted">
                    <span>
                      {formatGs(booking.amount)} · comision {booking.commission_pct}% (
                      {formatGs(commission)})
                    </span>
                    {cancelled ? (
                      <span className="text-xs font-medium text-sb-danger">Cancelada</span>
                    ) : (
                      <CancelBookingButton id={booking.id} guestName={booking.guest_name} />
                    )}
                  </div>
                  {booking.notes && (
                    <p className="mt-1 text-xs text-sb-cream-faint">{booking.notes}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
