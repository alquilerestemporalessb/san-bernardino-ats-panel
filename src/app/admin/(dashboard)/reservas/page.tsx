import { createClient } from "@/lib/supabase/server";
import { CancelBookingButton } from "@/components/CancelBookingButton";
import { formatDateEs, toISODate } from "@/lib/dates";
import { formatGs } from "@/lib/currency";
import type { BookingWithProperty } from "@/types/database";

async function getBookings(): Promise<BookingWithProperty[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("property_bookings")
    .select("*, properties(code, name)")
    .order("check_in", { ascending: false });
  return (data ?? []) as unknown as BookingWithProperty[];
}

function isThisMonth(iso: string) {
  const now = new Date();
  const monthStart = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  return iso >= monthStart && iso <= monthEnd;
}

export default async function ReservasPage() {
  const bookings = await getBookings();

  const thisMonth = bookings.filter((b) => b.status === "confirmada" && isThisMonth(b.check_in));
  const totalAmount = thisMonth.reduce((sum, b) => sum + b.amount, 0);
  const totalCommission = thisMonth.reduce((sum, b) => sum + (b.amount * b.commission_pct) / 100, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl text-sb-cream">Reservas</h1>
        <p className="text-sm text-sb-cream-muted">Resumen del mes en curso, por fecha de check-in.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:max-w-2xl sm:grid-cols-3">
        <div className="rounded-lg border border-sb-border-subtle bg-sb-bg-elevated px-5 py-4">
          <p className="text-2xl font-serif text-sb-cream">{thisMonth.length}</p>
          <p className="text-xs text-sb-cream-muted">Reservas confirmadas</p>
        </div>
        <div className="rounded-lg border border-sb-border-subtle bg-sb-bg-elevated px-5 py-4">
          <p className="text-2xl font-serif text-sb-cream">{formatGs(totalAmount)}</p>
          <p className="text-xs text-sb-cream-muted">Facturado</p>
        </div>
        <div className="rounded-lg border border-sb-border-subtle bg-sb-bg-elevated px-5 py-4">
          <p className="text-2xl font-serif text-sb-cream">{formatGs(totalCommission)}</p>
          <p className="text-xs text-sb-cream-muted">Comision ATS</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-lg border border-sb-border-subtle bg-sb-bg-elevated px-6 py-10 text-center">
          <p className="text-sm text-sb-cream-muted">Todavia no hay reservas cargadas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sb-border-subtle">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-sb-border-subtle bg-sb-bg-elevated text-left text-xs uppercase tracking-wider text-sb-cream-faint">
                <th className="px-4 py-3 font-medium">Propiedad</th>
                <th className="px-4 py-3 font-medium">Huesped</th>
                <th className="px-4 py-3 font-medium">Fechas</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Comision</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const commission = (booking.amount * booking.commission_pct) / 100;
                const cancelled = booking.status === "cancelada";
                return (
                  <tr
                    key={booking.id}
                    className={`border-b border-sb-border-subtle last:border-0 ${
                      cancelled ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-sb-cream">{booking.properties.code}</span>
                      <span className="ml-2 text-sb-cream-muted">{booking.properties.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sb-cream-muted">{booking.guest_name}</td>
                    <td className="px-4 py-3 text-sb-cream-muted">
                      {formatDateEs(booking.check_in)} — {formatDateEs(booking.check_out)}
                    </td>
                    <td className="px-4 py-3 text-sb-cream-muted">{formatGs(booking.amount)}</td>
                    <td className="px-4 py-3 text-sb-cream-muted">
                      {booking.commission_pct}% ({formatGs(commission)})
                    </td>
                    <td className="px-4 py-3">
                      {cancelled ? (
                        <span className="text-xs font-medium text-sb-danger">Cancelada</span>
                      ) : (
                        <span className="text-xs font-medium text-sb-accent">Confirmada</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!cancelled && (
                        <CancelBookingButton id={booking.id} guestName={booking.guest_name} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
