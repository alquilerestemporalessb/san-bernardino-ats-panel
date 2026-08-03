"use client";

import { useTransition } from "react";
import { deleteProperty } from "@/lib/actions/properties";

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`Eliminar "${name}"? Esta accion no se puede deshacer.`)) {
          startTransition(() => {
            deleteProperty(id);
          });
        }
      }}
      className="text-xs font-medium text-sb-danger transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
