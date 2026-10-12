"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No autenticado");
  }
  return supabase;
}

function revalidateAvailability(propertyId: string) {
  revalidatePath(`/admin/properties/${propertyId}/availability`);
  revalidatePath("/");
}

/** dates: array de strings "YYYY-MM-DD". bookingId: si el bloqueo viene de una reserva. */
export async function blockDates(propertyId: string, dates: string[], bookingId?: string) {
  if (dates.length === 0) return;
  const supabase = await requireUser();

  const { error } = await supabase
    .from("property_blocked_dates")
    .upsert(
      dates.map((date) => ({ property_id: propertyId, date, booking_id: bookingId ?? null })),
      { onConflict: "property_id,date", ignoreDuplicates: true }
    );

  if (error) throw new Error(error.message);
  revalidateAvailability(propertyId);
}

export async function unblockDates(propertyId: string, dates: string[]) {
  if (dates.length === 0) return;
  const supabase = await requireUser();

  const { error } = await supabase
    .from("property_blocked_dates")
    .delete()
    .eq("property_id", propertyId)
    .in("date", dates);

  if (error) throw new Error(error.message);
  revalidateAvailability(propertyId);
}

/** Libera solo las fechas que bloqueo esa reserva puntual, nunca bloqueos manuales ajenos. */
export async function unblockBookingDates(propertyId: string, bookingId: string) {
  const supabase = await requireUser();

  const { error } = await supabase
    .from("property_blocked_dates")
    .delete()
    .eq("property_id", propertyId)
    .eq("booking_id", bookingId);

  if (error) throw new Error(error.message);
  revalidateAvailability(propertyId);
}
