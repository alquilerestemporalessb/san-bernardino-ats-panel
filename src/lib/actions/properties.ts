"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const zone = String(formData.get("zone") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const whatsappMessage = String(formData.get("whatsapp_message") ?? "").trim();
  const latitudeRaw = String(formData.get("latitude") ?? "").trim();
  const longitudeRaw = String(formData.get("longitude") ?? "").trim();
  const photoUrls = formData
    .getAll("photo_urls")
    .map((v) => String(v).trim())
    .filter(Boolean);

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
    },
    photoUrls,
  } as const;
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
