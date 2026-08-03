"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { blockDates, unblockDates } from "@/lib/actions/availability";
import { datesInRange, fromISODate } from "@/lib/dates";

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

  const nights = Math.round(
    (fromISODate(checkOut).getTime() - fromISODate(checkIn).getTime()) / 86400000
  );

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("min_nights")
    .eq("id", propertyId)
    .single();
  if (propertyError) return { error: propertyError.message };
  if (nights < property.min_nights) {
    return {
      error: `La estadia tiene que ser de al menos ${property.min_nights} noche${property.min_nights === 1 ? "" : "s"} para esta propiedad.`,
    };
  }

  const dates = datesInRange(fromISODate(checkIn), fromISODate(checkOut));

  const { data: overlapping, error: overlapError } = await supabase
    .from("property_blocked_dates")
    .select("date")
    .eq("property_id", propertyId)
    .in("date", dates)
    .limit(1);
  if (overlapError) return { error: overlapError.message };
  if (overlapping && overlapping.length > 0) {
    return { error: "Esas fechas ya estan ocupadas para esta propiedad." };
  }

  const { error } = await supabase.from("property_bookings").insert({
    property_id: propertyId,
    guest_name: guestName,
    guest_contact: guestContact || null,
    check_in: checkIn,
    check_out: checkOut,
    amount,
    commission_pct: commissionPct,
    notes: notes || null,
  });
  if (error) return { error: error.message };

  await blockDates(propertyId, dates);

  revalidateBookings(propertyId);
  return {};
}

export async function cancelBooking(id: string) {
  const supabase = await requireUser();

  const { data: booking, error: fetchError } = await supabase
    .from("property_bookings")
    .select("property_id, check_in, check_out")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("property_bookings")
    .update({ status: "cancelada" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const dates = datesInRange(fromISODate(booking.check_in), fromISODate(booking.check_out));
  await unblockDates(booking.property_id, dates);

  revalidateBookings(booking.property_id);
}
