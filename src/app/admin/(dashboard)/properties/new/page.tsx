import Link from "next/link";
import { createProperty } from "@/lib/actions/properties";
import { PropertyForm } from "@/components/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin" className="text-xs text-sb-cream-faint hover:text-sb-cream-muted">
          ← Volver al listado
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-sb-cream">Nueva propiedad</h1>
      </div>

      <PropertyForm action={createProperty} submitLabel="Crear propiedad" />
    </div>
  );
}
