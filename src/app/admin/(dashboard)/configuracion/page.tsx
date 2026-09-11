import { createClient } from "@/lib/supabase/server";
import { getUsdToPygRate } from "@/lib/exchange-rate";
import { UsdRateForm } from "@/components/UsdRateForm";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const rate = await getUsdToPygRate(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl text-sb-cream">Configuración</h1>
        <p className="text-sm text-sb-cream-muted">Parámetros que usa el sitio y el panel.</p>
      </div>

      <section className="rounded-lg border border-sb-border-subtle bg-sb-bg-elevated px-5 py-5">
        <h2 className="mb-4 text-sm font-medium text-sb-cream">Cotización del dólar</h2>
        <UsdRateForm currentRate={rate} />
      </section>
    </div>
  );
}
