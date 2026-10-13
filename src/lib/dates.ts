export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

export function formatDateEs(iso: string): string {
  return fromISODate(iso).toLocaleDateString("es-PY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Lista de fechas ISO entre from y to, ambos extremos incluidos. */
export function datesInRange(from: Date, to: Date): string[] {
  const dates: string[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    dates.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/**
 * Noches ocupadas por una estadia: el check-out no cuenta, porque es el mismo dia en que puede
 * entrar el siguiente huesped (misma convencion que los bloques de property_rates).
 */
export function nightsInRange(checkIn: Date, checkOut: Date): string[] {
  const nights = datesInRange(checkIn, checkOut);
  nights.pop();
  return nights;
}
