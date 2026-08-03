import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toggleActive, toggleVerified } from "@/lib/actions/properties";
import { DeleteButton } from "@/components/DeleteButton";

export default async function PropertiesPage() {
  const supabase = await createClient();
  const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .order("code", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-sb-cream">Propiedades</h1>
          <p className="text-sm text-sb-cream-muted">
            {properties?.length ?? 0} propiedad{properties?.length === 1 ? "" : "es"} cargada
            {properties?.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="rounded-md bg-sb-accent px-4 py-2.5 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover"
        >
          + Nueva propiedad
        </Link>
      </div>

      {error && (
        <p className="rounded-md border border-sb-danger/40 bg-sb-danger/10 px-4 py-3 text-sm text-sb-danger">
          No se pudieron cargar las propiedades: {error.message}
        </p>
      )}

      {!error && properties && properties.length === 0 && (
        <div className="rounded-lg border border-sb-border-subtle bg-sb-bg-elevated px-6 py-10 text-center">
          <p className="text-sm text-sb-cream-muted">Todavia no hay propiedades cargadas.</p>
        </div>
      )}

      {!error && properties && properties.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-sb-border-subtle">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-sb-border-subtle bg-sb-bg-elevated text-left text-xs uppercase tracking-wider text-sb-cream-faint">
                <th className="px-4 py-3 font-medium">Codigo</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Capacidad</th>
                <th className="px-4 py-3 font-medium">Zona</th>
                <th className="px-4 py-3 font-medium">Verificada</th>
                <th className="px-4 py-3 font-medium">Activa</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b border-sb-border-subtle last:border-0">
                  <td className="px-4 py-3 font-medium text-sb-cream">{property.code}</td>
                  <td className="px-4 py-3 text-sb-cream">{property.name}</td>
                  <td className="px-4 py-3 text-sb-cream-muted">{property.capacity}</td>
                  <td className="px-4 py-3 text-sb-cream-muted">{property.zone}</td>
                  <td className="px-4 py-3">
                    <form action={toggleVerified.bind(null, property.id, !property.verified)}>
                      <button
                        type="submit"
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          property.verified
                            ? "border-sb-border-accent bg-sb-accent-muted text-sb-accent"
                            : "border-sb-border-subtle text-sb-cream-faint hover:border-sb-border-accent"
                        }`}
                      >
                        {property.verified ? "Verificada" : "Sin verificar"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleActive.bind(null, property.id, !property.active)}>
                      <button
                        type="submit"
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          property.active
                            ? "border-sb-border-subtle text-sb-cream-muted hover:border-sb-border-accent"
                            : "border-sb-danger/40 bg-sb-danger/10 text-sb-danger"
                        }`}
                      >
                        {property.active ? "Activa" : "Oculta"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/properties/${property.id}/availability`}
                        className="text-xs font-medium text-sb-cream-muted hover:text-sb-cream"
                      >
                        Disponibilidad
                      </Link>
                      <Link
                        href={`/admin/properties/${property.id}/edit`}
                        className="text-xs font-medium text-sb-cream-muted hover:text-sb-cream"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={property.id} name={property.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
