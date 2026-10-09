import { fromISODate, toISODate } from "@/lib/dates";
import type { PropertyRate } from "@/types/database";

export type QuoteModality = "bloque" | "fin_de_semana" | "noche";

export interface QuoteSuggestion {
  label: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  deposit: number | null;
}

export interface QuoteResult {
  status: "exact" | "computed" | "suggest" | "custom";
  modality: QuoteModality | null;
  nights: number;
  total: number | null;
  deposit: number | null;
  suggestions: QuoteSuggestion[];
}

const THURSDAY = 4;
const FRIDAY = 5;
const SUNDAY = 0;
const MONDAY = 1;

function daysBetween(a: string, b: string): number {
  return Math.round((fromISODate(b).getTime() - fromISODate(a).getTime()) / 86400000);
}

function weekday(iso: string): number {
  return fromISODate(iso).getDay();
}

function addDays(iso: string, days: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/**
 * Camino mas barato entre checkIn y checkOut usando filas 'bloque'/'extension' como aristas
 * (date_from -> date_to, peso price_gs; convencion: el check-out de una es el check-in de la
 * siguiente). Cubre con el mismo mecanismo un bloque unico (quincena, mes) y una fiesta
 * encadenada con su extension de fin de semana (23 a 27 dic, 30 dic a 3 ene), y cuando hay mas
 * de un camino posible (ej. "mes" vs "quincena + quincena") elige el mas barato para el huesped.
 */
function cheapestBlockChain(
  rates: PropertyRate[],
  checkIn: string,
  checkOut: string
): { total: number; deposit: number | null; rows: PropertyRate[] } | null {
  const edges = rates.filter((r) => r.active && (r.kind === "bloque" || r.kind === "extension"));

  const nodes = new Set<string>([checkIn, checkOut]);
  for (const edge of edges) {
    nodes.add(edge.date_from);
    nodes.add(edge.date_to);
  }

  const dist = new Map<string, number>([[checkIn, 0]]);
  const prevEdge = new Map<string, PropertyRate>();
  const prevNode = new Map<string, string>();
  const unvisited = new Set(nodes);

  while (unvisited.size > 0) {
    let current: string | null = null;
    let currentDist = Infinity;
    for (const node of unvisited) {
      const d = dist.get(node) ?? Infinity;
      if (d < currentDist) {
        currentDist = d;
        current = node;
      }
    }
    if (current === null || currentDist === Infinity) break;
    unvisited.delete(current);
    if (current === checkOut) break;

    for (const edge of edges) {
      if (edge.date_from !== current) continue;
      const candidate = currentDist + Number(edge.price_gs);
      if (candidate < (dist.get(edge.date_to) ?? Infinity)) {
        dist.set(edge.date_to, candidate);
        prevEdge.set(edge.date_to, edge);
        prevNode.set(edge.date_to, current);
      }
    }
  }

  if (!dist.has(checkOut)) return null;

  const rows: PropertyRate[] = [];
  let cursor = checkOut;
  while (cursor !== checkIn) {
    const edge = prevEdge.get(cursor);
    const prior = prevNode.get(cursor);
    if (!edge || !prior) return null;
    rows.unshift(edge);
    cursor = prior;
  }
  if (rows.length === 0) return null;

  // Las filas 'extension' no llevan garantia propia: la garantia es la del bloque base.
  const deposit = rows.find((r) => r.deposit_gs != null)?.deposit_gs ?? null;
  return { total: dist.get(checkOut) as number, deposit, rows };
}

/** Fin de semana: check-in jueves/viernes, check-out domingo/lunes, con extra por noche agregada. */
function weekendMatch(rates: PropertyRate[], checkIn: string, checkOut: string): QuoteResult | null {
  const nights = daysBetween(checkIn, checkOut);
  if (nights < 2 || nights > 4) return null;

  const inDay = weekday(checkIn);
  const outDay = weekday(checkOut);
  if (inDay !== THURSDAY && inDay !== FRIDAY) return null;
  if (outDay !== SUNDAY && outDay !== MONDAY) return null;

  const row = rates.find(
    (r) => r.active && r.kind === "fin_de_semana" && r.date_from <= checkIn && checkOut <= r.date_to
  );
  if (!row) return null;

  const extraNights = (inDay === THURSDAY ? 1 : 0) + (outDay === MONDAY ? 1 : 0);
  const extraTotal = extraNights * Number(row.extra_night_gs ?? 0);

  return {
    status: "computed",
    modality: "fin_de_semana",
    nights,
    total: Number(row.price_gs) + extraTotal,
    deposit: row.deposit_gs ?? null,
    suggestions: [],
  };
}

/**
 * Noches sueltas: cada noche pedida se cotiza con la tarifa 'noche' cuya ventana de vigencia la
 * cubre (soporta estadias que cruzan de una temporada a otra). Si no llega al minimo exigido,
 * no se cotiza — se sugiere la misma fecha de entrada extendida hasta cumplirlo.
 */
function nightlyMatch(rates: PropertyRate[], checkIn: string, checkOut: string): QuoteResult | null {
  const nights = daysBetween(checkIn, checkOut);
  const nocheRows = rates.filter((r) => r.active && r.kind === "noche");

  const perNight: PropertyRate[] = [];
  for (let i = 0; i < nights; i++) {
    const date = addDays(checkIn, i);
    const row = nocheRows.find((r) => r.date_from <= date && date < r.date_to);
    if (!row) return null;
    perNight.push(row);
  }

  const requiredMinNights = Math.max(...perNight.map((r) => r.min_nights ?? 1));
  const total = perNight.reduce((sum, r) => sum + Number(r.price_gs), 0);
  const deposit = perNight[0].deposit_gs ?? null;

  if (nights < requiredMinNights) {
    const suggestedCheckOut = addDays(checkIn, requiredMinNights);
    const suggestion = nightlyMatch(rates, checkIn, suggestedCheckOut);
    if (!suggestion || suggestion.total == null) return null;
    return {
      status: "suggest",
      modality: null,
      nights,
      total: null,
      deposit: null,
      suggestions: [
        {
          label: "Estadía mínima",
          checkIn,
          checkOut: suggestedCheckOut,
          nights: requiredMinNights,
          total: suggestion.total,
          deposit: suggestion.deposit,
        },
      ],
    };
  }

  return { status: "computed", modality: "noche", nights, total, deposit, suggestions: [] };
}

/** Bloques completos mas cercanos a las fechas pedidas, cuando nada calzo exacto ni por noche. */
function nearestBlockSuggestions(
  rates: PropertyRate[],
  checkIn: string,
  checkOut: string
): QuoteSuggestion[] {
  return rates
    .filter((r) => r.active && r.kind === "bloque")
    .map((row) => ({
      row,
      distance: Math.abs(daysBetween(checkIn, row.date_from)) + Math.abs(daysBetween(checkOut, row.date_to)),
    }))
    .filter((s) => s.distance <= 10)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(({ row }) => ({
      label: row.label,
      checkIn: row.date_from,
      checkOut: row.date_to,
      nights: daysBetween(row.date_from, row.date_to),
      total: Number(row.price_gs),
      deposit: row.deposit_gs ?? null,
    }));
}

/**
 * Cotiza una estadia a partir de las tarifas activas de una propiedad. Pura: no hace I/O.
 * Orden de resolucion: bloque exacto (o fiesta + extension encadenada) > fin de semana > noche
 * suelta > bloque mas cercano (sugerencia) > a medida por WhatsApp.
 */
export function quoteStay(rates: PropertyRate[], checkIn: string, checkOut: string): QuoteResult {
  const nights = daysBetween(checkIn, checkOut);
  if (nights <= 0) {
    return { status: "custom", modality: null, nights: 0, total: null, deposit: null, suggestions: [] };
  }

  const chain = cheapestBlockChain(rates, checkIn, checkOut);
  if (chain) {
    return {
      status: "exact",
      modality: "bloque",
      nights,
      total: chain.total,
      deposit: chain.deposit,
      suggestions: [],
    };
  }

  const weekend = weekendMatch(rates, checkIn, checkOut);
  if (weekend) return weekend;

  const nightly = nightlyMatch(rates, checkIn, checkOut);
  if (nightly) return nightly;

  const suggestions = nearestBlockSuggestions(rates, checkIn, checkOut);
  if (suggestions.length > 0) {
    return { status: "suggest", modality: null, nights, total: null, deposit: null, suggestions };
  }

  return { status: "custom", modality: null, nights, total: null, deposit: null, suggestions: [] };
}
