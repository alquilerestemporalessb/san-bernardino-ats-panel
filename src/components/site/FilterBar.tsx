"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { toISODate, fromISODate, formatDateEs } from "@/lib/dates";
import { AMENITIES } from "@/lib/amenities";

const capacityOptions = [2, 4, 6, 8, 10, 12];
const bedroomsOptions = [1, 2, 3, 4, 5];

export function FilterBar({ zones }: { zones: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [capacity, setCapacity] = useState(searchParams.get("capacity") ?? "");
  const [zone, setZone] = useState(searchParams.get("zone") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") ?? "");
  const [amenities, setAmenities] = useState<string[]>(searchParams.getAll("amenities"));
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");
    if (!checkin) return undefined;
    return { from: fromISODate(checkin), to: checkout ? fromISODate(checkout) : undefined };
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const amenitiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (amenitiesRef.current && !amenitiesRef.current.contains(event.target as Node)) {
        setShowAmenities(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function toggleAmenity(value: string) {
    setAmenities((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (capacity) params.set("capacity", capacity);
    if (zone) params.set("zone", zone);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    for (const amenity of amenities) params.append("amenities", amenity);
    if (range?.from) params.set("checkin", toISODate(range.from));
    if (range?.to) params.set("checkout", toISODate(range.to));
    const query = params.toString();
    router.push(`/${query ? `?${query}` : ""}#catalogo`);
    setShowCalendar(false);
    setShowAmenities(false);
  }

  function handleClear() {
    setCapacity("");
    setZone("");
    setMaxPrice("");
    setBedrooms("");
    setAmenities([]);
    setRange(undefined);
    router.push("/#catalogo");
  }

  const hasFilters = Boolean(
    capacity || zone || maxPrice || bedrooms || amenities.length > 0 || range?.from
  );
  const dateLabel = range?.from
    ? `${formatDateEs(toISODate(range.from))}${range.to ? ` — ${formatDateEs(toISODate(range.to))}` : ""}`
    : "Cuándo";
  const amenitiesLabel =
    amenities.length > 0 ? `Comodidades (${amenities.length})` : "Comodidades";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-sb-border-subtle bg-sb-bg-elevated p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
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
            className="btn-press flex-1 rounded-md bg-sb-accent px-5 py-2.5 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover sm:flex-none"
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="number"
          min={0}
          step="1"
          placeholder="Precio maximo (Gs.)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="rounded-md border border-sb-border-subtle bg-sb-bg px-3.5 py-2.5 text-sm text-sb-cream outline-none transition-colors hover:border-sb-border-accent sm:w-48"
        />

        <select
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          className="rounded-md border border-sb-border-subtle bg-sb-bg px-3.5 py-2.5 text-sm text-sb-cream outline-none transition-colors hover:border-sb-border-accent sm:w-44"
        >
          <option value="">Dormitorios</option>
          {bedroomsOptions.map((n) => (
            <option key={n} value={n}>
              {n}+ dormitorios
            </option>
          ))}
        </select>

        <div className="relative" ref={amenitiesRef}>
          <button
            type="button"
            onClick={() => setShowAmenities((v) => !v)}
            className="w-full rounded-md border border-sb-border-subtle bg-sb-bg px-3.5 py-2.5 text-left text-sm text-sb-cream outline-none transition-colors hover:border-sb-border-accent sm:w-48"
          >
            {amenitiesLabel}
          </button>
          {showAmenities && (
            <div className="absolute left-0 top-full z-20 mt-2 flex flex-col gap-2 rounded-xl border border-sb-border-subtle bg-sb-bg-elevated p-4 shadow-[0_16px_36px_rgba(0,0,0,0.45)]">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity.value}
                  className="flex items-center gap-2 whitespace-nowrap text-sm text-sb-cream-muted"
                >
                  <input
                    type="checkbox"
                    checked={amenities.includes(amenity.value)}
                    onChange={() => toggleAmenity(amenity.value)}
                    className="h-4 w-4 rounded border-sb-border-subtle accent-sb-accent"
                  />
                  {amenity.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
