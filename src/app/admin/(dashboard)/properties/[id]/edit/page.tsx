import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProperty } from "@/lib/actions/properties";
import { PropertyForm } from "@/components/PropertyForm";

export default async function EditPropertyPage(props: PageProps<"/admin/properties/[id]/edit">) {
  const { id } = await props.params;

  const supabase = await createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("*, property_photos(*)")
    .eq("id", id)
    .order("sort_order", { referencedTable: "property_photos" })
    .single();

  if (!property) notFound();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin" className="text-xs text-sb-cream-faint hover:text-sb-cream-muted">
          ← Volver al listado
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-sb-cream">Editar propiedad</h1>
        <p className="text-sm text-sb-cream-muted">{property.code}</p>
      </div>

      <PropertyForm
        action={updateProperty.bind(null, property.id)}
        defaultValues={{ ...property, photos: property.property_photos }}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
