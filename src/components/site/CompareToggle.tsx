"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export const MAX_COMPARE = 3;

export function CompareToggle({ code }: { code: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = searchParams.getAll("compare");
  const isSelected = selected.includes(code);
  const isDisabled = !isSelected && selected.length >= MAX_COMPARE;

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("compare");
    const next = isSelected ? selected.filter((c) => c !== code) : [...selected, code];
    for (const c of next) params.append("compare", c);
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }

  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-sb-cream-muted">
      <input
        type="checkbox"
        checked={isSelected}
        disabled={isDisabled}
        onChange={toggle}
        className="h-3.5 w-3.5 rounded border-sb-border-subtle accent-sb-accent disabled:opacity-40"
      />
      Comparar
    </label>
  );
}
