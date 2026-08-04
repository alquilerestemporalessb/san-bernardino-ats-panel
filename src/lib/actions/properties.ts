"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PropertyStatus } from "@/types/database";
import { AMENITIES } from "@/lib/amenities";

export interface PropertyFormState {
  error?: string;
}

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

/** Un alta/edicion/toggle tiene que reflejarse tanto en el listado del panel como en la landing publica. */
function revalidateCatalog() {
  revalidatePath("/admin");
  revalidatePath("/");
}

function readPropertyFields(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const zone = String(formData.get("zone") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const whatsappMessage = String(formData.get("whatsapp_message") ?? "").trim();
  const latitudeRaw = String(formData.get("latitude") ?? "").trim();
  const longitudeRaw = String(formData.get("longitude") ?? "").trim();
  const ownerName = String(formData.get("owner_name") ?? "").trim();
  const ownerContact = String(formData.get("owner_contact") ?? "").trim();
  const pricePerNightRaw = String(formData.get("price_per_night") ?? "").trim();
  const pricePerWeekRaw = String(formData.get("price_per_week") ?? "").trim();
  const pricePerMonthRaw = String(formData.get("price_per_month") ?? "").trim();
  const minNightsRaw = String(formData.get("min_nights") ?? "").trim();
  const bedroomsRaw = String(formData.get("bedrooms") ?? "").trim();
  const bedsRaw = String(formData.get("beds") ?? "").trim();
  const bathroomsRaw = String(formData.get("bathrooms") ?? "").trim();
  let tourUrl = String(formData.get("tour_url") ?? "").trim();
  const validAmenityValues = new Set(AMENITIES.map((a) => a.value));
  const amenities = formData
    .getAll("amenities")
    .map((v) => String(v))
    .filter((v) => validAmenityValues.has(v as (typeof AMENITIES)[number]["value"]));
  const photoUrls = formData
    .getAll("photo_urls")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (!id) return { error: "Falta el identificador de la propiedad." } as const;
  if (!code) return { error: "El codigo es obligatorio (ej. SB-001)." } as const;
  if (!name) return { error: "El nombre es obligatorio." } as const;
  if (!zone) return { error: "La zona es obligatoria." } as const;

  const capacity = Number(capacityRaw);
  if (!Number.isInteger(capacity) || capacity <= 0) {
    return { error: "La capacidad tiene que ser un numero entero mayor a 0." } as const;
  }

  let latitude: number | null = null;
  if (latitudeRaw) {
    latitude = Number(latitudeRaw);
    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      return { error: "La latitud tiene que ser un numero entre -90 y 90." } as const;
    }
  }

  let longitude: number | null = null;
  if (longitudeRaw) {
    longitude = Number(longitudeRaw);
    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      return { error: "La longitud tiene que ser un numero entre -180 y 180." } as const;
    }
  }

  let pricePerNight: number | null = null;
  if (pricePerNightRaw) {
    pricePerNight = Number(pricePerNightRaw);
    if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
      return { error: "El precio por noche tiene que ser un numero mayor a 0." } as const;
    }
  }

  let pricePerWeek: number | null = null;
  if (pricePerWeekRaw) {
    pricePerWeek = Number(pricePerWeekRaw);
    if (!Number.isFinite(pricePerWeek) || pricePerWeek <= 0) {
      return { error: "El precio por semana tiene que ser un numero mayor a 0." } as const;
    }
  }

  let pricePerMonth: number | null = null;
  if (pricePerMonthRaw) {
    pricePerMonth = Number(pricePerMonthRaw);
    if (!Number.isFinite(pricePerMonth) || pricePerMonth <= 0) {
      return { error: "El precio por mes tiene que ser un numero mayor a 0." } as const;
    }
  }

  let minNights = 1;
  if (minNightsRaw) {
    minNights = Number(minNightsRaw);
    if (!Number.isInteger(minNights) || minNights < 1) {
      return { error: "El minimo de noches tiene que ser un numero entero mayor o igual a 1." } as const;
    }
  }

  let bedrooms: number | null = null;
  if (bedroomsRaw) {
    bedrooms = Number(bedroomsRaw);
    if (!Number.isInteger(bedrooms) || bedrooms < 0) {
      return { error: "Dormitorios tiene que ser un numero entero mayor o igual a 0." } as const;
    }
  }

  let beds: number | null = null;
  if (bedsRaw) {
    beds = Number(bedsRaw);
    if (!Number.isInteger(beds) || beds < 0) {
      return { error: "Camas tiene que ser un numero entero mayor o igual a 0." } as const;
    }
  }

  let bathrooms: number | null = null;
  if (bathroomsRaw) {
    bathrooms = Number(bathroomsRaw);
    if (!Number.isInteger(bathrooms) || bathrooms < 0) {
      return { error: "Banos tiene que ser un numero entero mayor o igual a 0." } as const;
    }
  }

  // Error comun: pegar el link normal de Vimeo (vimeo.com/ID) en vez del link del reproductor
  // (player.vimeo.com/video/ID) — el primero no se puede embeber en un iframe. Se corrige solo.
  const vimeoLinkMatch = tourUrl.match(/^https:\/\/vimeo\.com\/(\d+)/);
  if (vimeoLinkMatch) {
    tourUrl = `https://player.vimeo.com/video/${vimeoLinkMatch[1]}`;
  }

  if (tourUrl && !tourUrl.startsWith("https://")) {
    return { error: "El link del tour tiene que empezar con https://" } as const;
  }

  return {
    fields: {
      id,
      code,
      name,
      capacity,
      zone,
      description: description || null,
      whatsapp_message: whatsappMessage || null,
      latitude,
      longitude,
      price_per_night: pricePerNight,
      price_per_week: pricePerWeek,
      price_per_month: pricePerMonth,
      min_nights: minNights,
      bedrooms,
      beds,
      bathrooms,
      amenities,
      tour_url: tourUrl || null,
    },
    ownerName,
    ownerContact,
    photoUrls,
  } as const;
}

async function saveOwner(
  supabase: Awaited<ReturnType<typeof requireUser>>,
  propertyId: string,
  ownerName: string,
  ownerContact: string
) {
  if (!ownerName) {
    const { error } = await supabase
      .from("property_owners")
      .delete()
      .eq("property_id", propertyId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("property_owners").upsert({
    property_id: propertyId,
    owner_name: ownerName,
    owner_contact: ownerContact || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

async function replacePropertyPhotos(
  supabase: Awaited<ReturnType<typeof requireUser>>,
  propertyId: string,
  photoUrls: string[]
) {
  const { error: deleteError } = await supabase
    .from("property_photos")
    .delete()
    .eq("property_id", propertyId);
  if (deleteError) throw new Error(deleteError.message);

  if (photoUrls.length === 0) return;

  const { error: insertError } = await supabase.from("property_photos").insert(
    photoUrls.map((url, index) => ({
      property_id: propertyId,
      url,
      sort_order: index,
    }))
  );
  if (insertError) throw new Error(insertError.message);
}

export async function createProperty(
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const supabase = await requireUser();

  const parsed = readPropertyFields(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { data: inserted, error } = await supabase
    .from("properties")
    .insert(parsed.fields)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: `Ya existe una propiedad con el codigo ${parsed.fields.code}.` };
    }
    return { error: error.message };
  }

  await replacePropertyPhotos(supabase, inserted.id, parsed.photoUrls);
  await saveOwner(supabase, inserted.id, parsed.ownerName, parsed.ownerContact);

  revalidateCatalog();
  redirect("/admin");
}

export async function updateProperty(
  id: string,
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const supabase = await requireUser();

  const parsed = readPropertyFields(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase.from("properties").update(parsed.fields).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: `Ya existe una propiedad con el codigo ${parsed.fields.code}.` };
    }
    return { error: error.message };
  }

  await replacePropertyPhotos(supabase, id, parsed.photoUrls);
  await saveOwner(supabase, id, parsed.ownerName, parsed.ownerContact);

  revalidateCatalog();
  redirect("/admin");
}

export async function deleteProperty(id: string) {
  const supabase = await requireUser();
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateCatalog();
}

export async function toggleVerified(id: string, nextValue: boolean) {
  const supabase = await requireUser();
  const { error } = await supabase
    .from("properties")
    .update({ verified: nextValue })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateCatalog();
}

export async function toggleActive(id: string, nextValue: boolean) {
  const supabase = await requireUser();
  const { error } = await supabase.from("properties").update({ active: nextValue }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateCatalog();
}

export async function updatePropertyStatus(id: string, status: PropertyStatus) {
  const supabase = await requireUser();
  const { error } = await supabase.from("properties").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateCatalog();
}
