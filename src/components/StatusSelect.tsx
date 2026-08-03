"use client";

import { useTransition } from "react";
import { updatePropertyStatus } from "@/lib/actions/properties";
import type { PropertyStatus } from "@/types/database";

const STATUS_LABELS: Record<PropertyStatus, string> = {
  disponible: "Disponible",
  reservada: "Reservada",
  alquilada_temporada: "Alquilada temporada",
};

export function StatusSelect({ id, status }: { id: string; status: PropertyStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as PropertyStatus;
        startTransition(() => {
          updatePropertyStatus(id, next);
        });
      }}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
        status === "disponible"
          ? "border-sb-border-subtle bg-sb-bg-elevated text-sb-cream-muted"
          : "border-sb-border-accent bg-sb-accent-muted text-sb-accent"
      }`}
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
