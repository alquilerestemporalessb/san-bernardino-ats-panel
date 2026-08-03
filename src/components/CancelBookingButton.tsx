"use client";

import { useTransition } from "react";
import { cancelBooking } from "@/lib/actions/bookings";

export function CancelBookingButton({ id, guestName }: { id: string; guestName: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`Cancelar la reserva de "${guestName}"? Se liberan las fechas del calendario.`)) {
          startTransition(() => {
            cancelBooking(id);
          });
        }
      }}
      className="text-xs font-medium text-sb-danger transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      {pending ? "Cancelando..." : "Cancelar"}
    </button>
  );
}
