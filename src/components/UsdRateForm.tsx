"use client";

import { useActionState } from "react";
import { updateUsdRate, type SettingsFormState } from "@/lib/actions/settings";

const initialState: SettingsFormState = {};

export function UsdRateForm({ currentRate }: { currentRate: number }) {
  const [state, formAction, pending] = useActionState(updateUsdRate, initialState);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-3">
      <label htmlFor="usd_to_pyg_rate" className="text-xs font-medium text-sb-cream-muted">
        Cotización del dólar (Gs por 1 USD)
      </label>
      <input
        id="usd_to_pyg_rate"
        name="usd_to_pyg_rate"
        type="number"
        min={1}
        step="1"
        required
        defaultValue={currentRate}
        className="rounded-md border border-sb-border-subtle bg-sb-bg-elevated px-3.5 py-2.5 text-sm text-sb-cream outline-none focus:border-sb-border-accent"
      />
      <p className="text-xs text-sb-cream-faint">
        Se usa para convertir precios en el filtro del sitio público y para el total combinado del
        resumen de reservas. No cambia los montos ya cargados, solo cómo se comparan y se suman.
      </p>

      {state.error && (
        <p role="alert" className="text-sm text-sb-danger">
          {state.error}
        </p>
      )}
      {state.ok && !pending && (
        <p className="text-sm text-sb-accent">Cotización guardada.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-sb-accent px-5 py-2.5 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar cotización"}
      </button>
    </form>
  );
}
