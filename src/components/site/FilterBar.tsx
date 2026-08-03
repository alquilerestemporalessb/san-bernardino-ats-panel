"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { toISODate, fromISODate, formatDateEs } from "@/lib/dates";

const capacityOptions = [2, 4, 6, 8, 10, 12];

export function FilterBar({ zones }: { zones: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [capacity, setCapacity] = useState(searchParams.get("capacity") ?? "");
  const [zone, setZone] = useState(searchParams.get("zone") ?? "");
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");
    if (!checkin) return undefined;
    return { from: fromISODate(checkin), to: checkout ? fromISODate(checkout) : undefined };
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function handleSearch() {
    const params = new URLSearchParams();
    if (capacity) params.set("capacity", capacity);
    if (zone) params.set("zone", zone);
    if (range?.from) params.set("checkin", toISODate(range.from));
    if (range?.to) params.set("checkout", toISODate(range.to));
    const query = params.toString();
    router.push(`/${query ? `?${query}` : ""}#catalogo`);
    setShowCalendar(false);
  }

  function handleClear() {
    setCapacity("");
    setZone("");
    setRange(undefined);
    router.push("/#catalogo");
  }

  const hasFilters = Boolean(capacity || zone || range?.from);
  const dateLabel = range?.from
    ? `${formatDateEs(toISODate(range.from))}${range.to ? ` — ${formatDateEs(toISODate(range.to))}` : ""}`
    : "Cuándo";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-sb-border-subtle bg-sb-bg-elevated p-4 sm:flex-row sm:items-center sm:gap-3">
      <div className="relative flex-1" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          className="w-full rounded-md border border-sb-border-subtle bg-sb-bg px-3.5 py-2.5 text-left text-sm text-sb-cream outline-none transition-colors hover:border-sb-border-accent"
        >
          {dateLabel}
        </button>
        {showCalendar && (
          <div className="absolute left-0 top-full z-20 mt-2 rounded-xl border border-sb-border-subtle bg-sb-bg-elevated p-3 shadow-[0_16px_36px_rgba(0,0,0,0.45)]">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              disabled={{ before: today }}
              numberOfMonths={1}
            />
          </div>
        )}
      </div>

      <select
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        className="rounded-md border border-sb-border-subtle bg-sb-bg px-3.5 py-2.5 text-sm text-sb-cream outline-none transition-colors hover:border-sb-border-accent sm:w-44"
      >
        <option value="">Capacidad</option>
        {capacityOptions.map((n) => (
          <option key={n} value={n}>
            {n}+ personas
          </option>
        ))}
      </select>

      <select
        value={zone}
        onChange={(e) => setZone(e.target.value)}
        className="rounded-md border border-sb-border-subtle bg-sb-bg px-3.5 py-2.5 text-sm text-sb-cream outline-none transition-colors hover:border-sb-border-accent sm:w-44"
      >
        <option value="">Zona</option>
        {zones.map((z) => (
          <option key={z} value={z}>
            {z}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSearch}
          className="flex-1 rounded-md bg-sb-accent px-5 py-2.5 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover sm:flex-none"
        >
          Buscar
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-sb-border-subtle px-3 py-2.5 text-sm text-sb-cream-muted transition-colors hover:border-sb-border-accent"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
