"use client";

import { useMemo, useState, useTransition } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { blockDates, unblockDates } from "@/lib/actions/availability";
import { toISODate, formatDateEs, fromISODate, datesInRange } from "@/lib/dates";

/** Agrupa fechas ISO consecutivas para mostrar "10 ago - 14 ago" en vez de 5 filas sueltas. */
function groupConsecutive(sortedDates: string[]): string[][] {
  const groups: string[][] = [];
  for (const date of sortedDates) {
    const lastGroup = groups[groups.length - 1];
    const lastDate = lastGroup?.[lastGroup.length - 1];
    if (lastDate) {
      const expectedNext = toISODate(new Date(fromISODate(lastDate).getTime() + 86400000));
      if (expectedNext === date) {
        lastGroup.push(date);
        continue;
      }
    }
    groups.push([date]);
  }
  return groups;
}

export function AvailabilityCalendar({
  propertyId,
  initialBlockedDates,
}: {
  propertyId: string;
  initialBlockedDates: string[];
}) {
  const [blocked, setBlocked] = useState(() => new Set(initialBlockedDates));
  const [range, setRange] = useState<DateRange | undefined>();
  const [pending, startTransition] = useTransition();

  const blockedGroups = useMemo(
    () => groupConsecutive([...blocked].sort()),
    [blocked]
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  function handleBlock() {
    if (!range?.from) return;
    const dates = datesInRange(range.from, range.to ?? range.from);
    startTransition(async () => {
      await blockDates(propertyId, dates);
      setBlocked((prev) => new Set([...prev, ...dates]));
      setRange(undefined);
    });
  }

  function handleUnblock(group: string[]) {
    startTransition(async () => {
      await unblockDates(propertyId, group);
      setBlocked((prev) => {
        const next = new Set(prev);
        group.forEach((d) => next.delete(d));
        return next;
      });
    });
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="rounded-xl border border-sb-border-subtle bg-sb-bg-elevated p-3">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={[{ before: today }, ...[...blocked].map(fromISODate)]}
          modifiers={{ blocked: [...blocked].map(fromISODate) }}
          modifiersClassNames={{ blocked: "rdp-day_blocked" }}
        />
        <button
          type="button"
          onClick={handleBlock}
          disabled={!range?.from || pending}
          className="mt-2 w-full rounded-md bg-sb-accent px-4 py-2.5 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Bloquear fechas seleccionadas"}
        </button>
      </div>

      <div className="flex-1">
        <h3 className="mb-3 text-sm font-medium text-sb-cream-muted">Fechas ocupadas</h3>
        {blockedGroups.length === 0 ? (
          <p className="text-sm text-sb-cream-faint">
            No hay fechas bloqueadas — la propiedad aparece disponible para cualquier rango en la
            búsqueda pública.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {blockedGroups.map((group) => (
              <li
                key={group[0]}
                className="flex items-center justify-between rounded-md border border-sb-border-subtle px-4 py-2.5 text-sm text-sb-cream"
              >
                <span>
                  {group.length === 1
                    ? formatDateEs(group[0])
                    : `${formatDateEs(group[0])} — ${formatDateEs(group[group.length - 1])}`}
                </span>
                <button
                  type="button"
                  onClick={() => handleUnblock(group)}
                  disabled={pending}
                  className="text-xs font-medium text-sb-danger hover:opacity-80 disabled:opacity-50"
                >
                  Desbloquear
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
