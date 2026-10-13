"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { blockDates, unblockBookingDates } from "@/lib/actions/availability";
import { nightsInRange, fromISODate } from "@/lib/dates";

export interface BookingFormState {
  error?: string;
}

const DEFAULT_COMMISSION_PCT = 10;

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

function revalidateBookings(propertyId: string) {
  revalidatePath(`/admin/properties/${propertyId}/bookings`);
  revalidatePath(`/admin/properties/${propertyId}/availability`);
  revalidatePath("/admin/reservas");
  revalidatePath("/");
}

export async function createBooking(
  propertyId: string,
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const supabase = await requireUser();

  const guestName = String(formData.get("guest_name") ?? "").trim();
  const guestContact = String(formData.get("guest_contact") ?? "").trim();
  const checkIn = String(formData.get("check_in") ?? "").trim();
  const checkOut = String(formData.get("check_out") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const currency = String(formData.get("currency")) === "USD" ? "USD" : "PYG";
  const commissionRaw = String(formData.get("commission_pct") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!guestName) return { error: "El nombre del huesped es obligatorio." };
  if (!checkIn || !checkOut) {
    return { error: "Elegi el rango de fechas de la reserva en el calendario." };
  }
  if (checkOut <= checkIn) {
    return { error: "El check-out tiene que ser posterior al check-in." };
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El monto tiene que ser un numero mayor a 0." };
  }

  const commissionPct = commissionRaw ? Number(commissionRaw) : DEFAULT_COMMISSION_PCT;
  if (!Number.isFinite(commissionPct) || commissionPct < 0 || commissionPct > 100) {
    return { error: "La comision tiene que ser un numero entre 0 y 100." };
  }

  const nightDates = nightsInRange(fromISODate(checkIn), fromISODate(checkOut));
  const nightsCount = nightDates.length;

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("min_nights")
    .eq("id", propertyId)
    .single();
  if (propertyError) return { error: propertyError.message };
  if (nightsCount < property.min_nights) {
    return {
      error: `La estadia tiene que ser de al menos ${property.min_nights} noche${property.min_nights === 1 ? "" : "s"} para esta propiedad.`,
    };
  }

  const { data: overlapping, error: overlapError } = await supabase
    .from("property_blocked_dates")
    .select("date")
    .eq("property_id", propertyId)
    .in("date", nightDates)
    .limit(1);
  if (overlapError) return { error: overlapError.message };
  if (overlapping && overlapping.length > 0) {
    return { error: "Esas fechas ya estan ocupadas para esta propiedad." };
  }

  const { data: booking, error } = await supabase
    .from("property_bookings")
    .insert({
      property_id: propertyId,
      guest_name: guestName,
      guest_contact: guestContact || null,
      check_in: checkIn,
      check_out: checkOut,
      amount,
      currency,
      commission_pct: commissionPct,
      notes: notes || null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  try {
    await blockDates(propertyId, nightDates, booking.id);
  } catch (blockError) {
    // Compensacion: si no se pudieron bloquear las fechas, no dejamos la reserva huerfana.
    await supabase.from("property_bookings").delete().eq("id", booking.id);
    const message = blockError instanceof Error ? blockError.message : "Error desconocido";
    return { error: `No se pudieron bloquear las fechas, la reserva no se guardo: ${message}` };
  }

  revalidateBookings(propertyId);
  return {};
}

export async function cancelBooking(id: string) {
  const supabase = await requireUser();

  const { data: booking, error: fetchError } = await supabase
    .from("property_bookings")
    .select("property_id, status")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("property_bookings")
    .update({ status: "cancelada" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  try {
    // Solo libera las fechas que bloqueo esta reserva, nunca bloqueos manuales ajenos.
    await unblockBookingDates(booking.property_id, id);
  } catch (unblockError) {
    // Compensacion: si no se pudieron liberar las fechas, no dejamos la reserva marcada
    // como cancelada con las fechas todavia bloqueadas por ella.
    await supabase.from("property_bookings").update({ status: booking.status }).eq("id", id);
    throw unblockError;
  }

  revalidateBookings(booking.property_id);
}
