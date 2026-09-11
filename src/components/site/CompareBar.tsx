"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function CompareBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = searchParams.getAll("compare");

  if (selected.length === 0) return null;

  function remove(code: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("compare");
    for (const c of selected) {
      if (c !== code) params.append("compare", c);
    }
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }

  function clear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("compare");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }

  const compareParams = new URLSearchParams();
  for (const c of selected) compareParams.append("compare", c);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-site-border bg-site-bg-elevated/95 shadow-[0_-12px_30px_rgba(36,31,24,0.1)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-3">
        <span className="text-xs font-medium text-site-ink-muted">Comparar:</span>
        <div className="flex flex-wrap items-center gap-2">
          {selected.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1.5 rounded-full border border-site-border bg-site-bg px-3 py-1 text-xs text-site-ink"
            >
              {code.toUpperCase()}
              <button
                type="button"
                onClick={() => remove(code)}
                aria-label={`Quitar ${code.toUpperCase()} de la comparacion`}
                className="text-site-ink-faint hover:text-site-danger"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium text-site-ink-muted hover:text-site-ink"
          >
            Limpiar
          </button>
          <Link
            href={`/comparar?${compareParams.toString()}`}
            className="btn-press rounded-full bg-site-terracotta px-4 py-2 text-xs font-semibold text-site-bg transition-colors hover:bg-site-terracotta-hover"
          >
            Comparar ({selected.length})
          </Link>
        </div>
      </div>
    </div>
  );
}
