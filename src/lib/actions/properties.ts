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
  const photoUrl = String(formData.get("photo_url") ?? "").trim();
  const whatsappMessage = String(formData.get("whatsapp_message") ?? "").trim();

  if (!code) return { error: "El codigo es obligatorio (ej. SB-001)." } as const;
  if (!name) return { error: "El nombre es obligatorio." } as const;
  if (!zone) return { error: "La zona es obligatoria." } as const;

  const capacity = Number(capacityRaw);
  if (!Number.isInteger(capacity) || capacity <= 0) {
    return { error: "La capacidad tiene que ser un numero entero mayor a 0." } as const;
  }

  return {
    fields: {
      code,
      name,
      capacity,
      zone,
      description: description || null,
      photo_url: photoUrl || null,
      whatsapp_message: whatsappMessage || null,
    },
  } as const;
}

export async function createProperty(
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const supabase = await requireUser();

  const parsed = readPropertyFields(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase.from("properties").insert(parsed.fields);

  if (error) {
    if (error.code === "23505") {
      return { error: `Ya existe una propiedad con el codigo ${parsed.fields.code}.` };
    }
    return { error: error.message };
  }

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
