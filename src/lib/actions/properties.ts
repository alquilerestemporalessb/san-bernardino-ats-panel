"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PropertyStatus } from "@/types/database";
import { AMENITIES } from "@/lib/amenities";

export interface PropertyFormState {
  error?: string;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

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
  const bedroomsRaw = String(formData.get("bedrooms") ?? "").trim();
  const bedsRaw = String(formData.get("beds") ?? "").trim();
  const bathroomsRaw = String(formData.get("bathrooms") ?? "").trim();
  const tourUrl = String(formData.get("tour_url") ?? "").trim();
  const validAmenityValues = new Set(AMENITIES.map((a) => a.value));
  const amenities = formData
    .getAll("amenities")
    .map((v) => String(v))
    .filter((v) => validAmenityValues.has(v as (typeof AMENITIES)[number]["value"]));
  const existingPhotoUrls = formData
    .getAll("existing_photo_urls")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const newPhotoFiles = formData
    .getAll("new_photos")
    .filter((v): v is File => v instanceof File && v.size > 0);

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

  if (tourUrl && !tourUrl.startsWith("https://")) {
    return { error: "El link del tour tiene que empezar con https://" } as const;
  }

  for (const file of newPhotoFiles) {
    if (!file.type.startsWith("image/")) {
      return { error: `"${file.name}" no es una imagen valida.` } as const;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return { error: `"${file.name}" pesa mas de 5MB.` } as const;
    }
  }

  return {
    fields: {
      code,
      name,
      capacity,
      zone,
      description: description || null,
      whatsapp_message: whatsappMessage || null,
      latitude,
      longitude,
      price_per_night: pricePerNight,
      bedrooms,
      beds,
      bathrooms,
      amenities,
      tour_url: tourUrl || null,
    },
    ownerName,
    ownerContact,
    existingPhotoUrls,
    newPhotoFiles,
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

async function uploadPropertyPhotos(
  supabase: Awaited<ReturnType<typeof requireUser>>,
  propertyId: string,
  files: File[]
) {
  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const path = `${propertyId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("property-photos").upload(path, file, {
      contentType: file.type,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("property-photos").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
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

  const uploadedUrls = await uploadPropertyPhotos(supabase, inserted.id, parsed.newPhotoFiles);
  await replacePropertyPhotos(supabase, inserted.id, [...parsed.existingPhotoUrls, ...uploadedUrls]);
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

  const uploadedUrls = await uploadPropertyPhotos(supabase, id, parsed.newPhotoFiles);
  await replacePropertyPhotos(supabase, id, [...parsed.existingPhotoUrls, ...uploadedUrls]);
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
