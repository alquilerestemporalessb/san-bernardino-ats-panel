"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { formatMoney } from "@/lib/currency";
import { buildQuoteWhatsappLink, buildCustomQuoteWhatsappLink } from "@/lib/whatsapp";
import { formatDateEs, fromISODate, toISODate } from "@/lib/dates";
import { quoteStay, type QuoteSuggestion } from "@/lib/quote-stay";
import { CHECK_IN_TIME, CHECK_OUT_TIME } from "@/lib/stay-rules";
import { CalendarIcon, WhatsappIcon } from "./icons";
import { WhatsappCtaLink } from "./WhatsappCtaLink";
import type { Property, PropertyRate } from "@/types/database";

const MODALITY_LABELS = {
  bloque: "estadía por bloque",
  fin_de_semana: "fin de semana",
  noche: "por noche",
} as const;

type RateBookingProperty = Pick<Property, "id" | "code" | "name">;

export function RateBookingWidget({
  property,
  rates,
  blockedDates,
}: {
  property: RateBookingProperty;
  rates: PropertyRate[];
  blockedDates: string[];
}) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);

  const blockedDays = useMemo(() => blockedDates.map(fromISODate), [blockedDates]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayISO = useMemo(() => toISODate(today), [today]);

  // Un solo clic deja from == to — esperamos el segundo clic real antes de cotizar.
  const hasRealRange = Boolean(range?.from && range?.to && range.to.getTime() !== range.from.getTime());
  const checkInISO = range?.from ? toISODate(range.from) : null;
  const checkOutISO = range?.to ? toISODate(range.to) : null;

  const quote = useMemo(() => {
    if (!hasRealRange || !checkInISO || !checkOutISO) return null;
    return quoteStay(rates, checkInISO, checkOutISO);
  }, [hasRealRange, checkInISO, checkOutISO, rates]);

  const dateRangeLabel =
    checkInISO && checkOutISO ? `${formatDateEs(checkInISO)} al ${formatDateEs(checkOutISO)}` : undefined;

  // Si la cotizacion es a medida y no hay sugerencias cercanas, igual ofrecemos el proximo
  // bloque libre (por fecha, sin el tope de distancia que usa quoteStay para "suggest") para que
  // nunca sea un callejon sin salida.
  const nearestFutureBlock = useMemo(() => {
    if (!quote || quote.status !== "custom" || quote.suggestions.length > 0) return null;
    return (
      rates
        .filter((r) => r.active && r.kind === "bloque" && r.date_from >= todayISO)
        .sort((a, b) => (a.date_from < b.date_from ? -1 : 1))[0] ?? null
    );
  }, [quote, rates, todayISO]);

  function selectSuggestion(s: QuoteSuggestion) {
    setRange({ from: fromISODate(s.checkIn), to: fromISODate(s.checkOut) });
    setShowCalendar(false);
  }

  function selectBlock(row: PropertyRate) {
    setRange({ from: fromISODate(row.date_from), to: fromISODate(row.date_to) });
    setShowCalendar(false);
  }

  const whatsappHref =
    quote && dateRangeLabel
      ? quote.status === "custom"
        ? buildCustomQuoteWhatsappLink(property, { dateRangeLabel, nights: quote.nights })
        : quote.total != null
          ? buildQuoteWhatsappLink(property, {
              dateRangeLabel,
              nights: quote.nights,
              totalLabel: formatMoney(quote.total, "PYG"),
            })
          : null
      : null;

  const depositLine =
    quote?.deposit != null
      ? `Garantía reembolsable: ${formatMoney(quote.deposit, "PYG")}`
      : "Se abona una garantía reembolsable, se coordina por WhatsApp.";

  const calendar = (
    <div className="site-calendar site-calendar--rates rounded-2xl bg-site-bg p-2">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={(next) => {
          setRange(next);
          if (next?.from && next?.to && next.to.getTime() !== next.from.getTime()) {
            setShowCalendar(false);
          }
        }}
        disabled={[{ before: today }, ...blockedDays]}
        numberOfMonths={1}
      />
    </div>
  );

  const resultSection = (
    <div>
      {!quote && <p className="text-sm text-site-ink-faint">Elegí tus fechas para ver el total.</p>}

      {quote && (quote.status === "exact" || quote.status === "computed") && quote.total != null && (
        <div>
          <p className="text-xs uppercase tracking-wide text-site-ink-faint">Total de la estadía</p>
          <p className="mt-1 font-display text-3xl font-semibold text-site-ink">
            {formatMoney(quote.total, "PYG")}
          </p>
          <p className="mt-1 text-xs text-site-ink-muted">
            {quote.nights} noche{quote.nights === 1 ? "" : "s"} · {MODALITY_LABELS[quote.modality!]}
          </p>
        </div>
      )}

      {quote && quote.status === "suggest" && (
        <div>
          <p className="text-sm text-site-ink-muted">
            Esas fechas no encajan justo con una tarifa cargada. Mirá estas opciones cercanas:
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {quote.suggestions.map((s) => (
              <li key={`${s.checkIn}-${s.checkOut}`}>
                <button
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="text-left text-sm text-site-terracotta underline-offset-2 hover:underline"
                >
                  {s.label}: {formatDateEs(s.checkIn)} al {formatDateEs(s.checkOut)} —{" "}
                  {formatMoney(s.total, "PYG")}
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/#catalogo"
            className="mt-4 inline-block text-xs text-site-ink-faint hover:text-site-ink-muted"
          >
            Ver otras propiedades →
          </Link>
        </div>
      )}

      {quote && quote.status === "custom" && (
        <div>
          <p className="font-display text-lg text-site-ink">Armamos tu cotización a medida</p>
          <p className="mt-1.5 text-sm text-site-ink-muted">
            No tenemos un precio exacto cargado para esas fechas — lo coordinamos directo por
            WhatsApp.
          </p>
          {nearestFutureBlock && (
            <button
              type="button"
              onClick={() => selectBlock(nearestFutureBlock)}
              className="mt-3 block text-left text-sm text-site-terracotta underline-offset-2 hover:underline"
            >
              Bloque libre más cercano: {nearestFutureBlock.label} ({formatDateEs(nearestFutureBlock.date_from)}{" "}
              al {formatDateEs(nearestFutureBlock.date_to)})
            </button>
          )}
          <Link
            href="/#catalogo"
            className="mt-3 inline-block text-xs text-site-ink-faint hover:text-site-ink-muted"
          >
            Ver otras propiedades →
          </Link>
        </div>
      )}
    </div>
  );

  const cta = whatsappHref && quote ? (
    <WhatsappCtaLink
      propertyId={property.id}
      href={whatsappHref}
      modality={quote.status === "custom" ? "custom" : quote.modality ?? undefined}
      totalGs={quote.total ?? undefined}
      className="btn-press animate-pulse-glow inline-flex items-center justify-center gap-2 rounded-full bg-site-whatsapp px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-site-whatsapp-hover"
    >
      <WhatsappIcon className="h-[18px] w-[18px]" />
      {quote.status === "custom" ? "Consultar por WhatsApp" : "Consultar disponibilidad"}
    </WhatsappCtaLink>
  ) : null;

  const footerLines = (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-site-ink-faint">{depositLine}</p>
      <p className="text-xs text-site-ink-faint">
        Entrada {CHECK_IN_TIME} · Salida {CHECK_OUT_TIME}
      </p>
    </div>
  );

  return (
    <>
      {/* Desktop: tarjeta flotante sticky, calendario siempre visible (es la entrada principal) */}
      <div className="hidden flex-col gap-6 rounded-3xl bg-site-bg-elevated p-6 shadow-[0_40px_80px_rgba(36,31,24,0.05)] lg:sticky lg:top-24 lg:flex">
        {calendar}
        {resultSection}
        {cta}
        {footerLines}
        <p className="text-center text-xs text-site-ink-faint">
          Sin costo de reserva · respuesta directa del equipo
        </p>
      </div>

      {/* Mobile: barra fija abajo. Texto de fechas/total abre el modal; a la derecha, WhatsApp
          cuando ya hay cotizacion, o el boton que abre el modal cuando todavia no. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 bg-site-bg-elevated/95 px-4 py-3 shadow-[0_-16px_40px_rgba(36,31,24,0.08)] backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setShowCalendar(true)}
          className="min-w-0 flex-1 text-left"
        >
          {quote && (quote.status === "exact" || quote.status === "computed") && quote.total != null ? (
            <>
              <p className="truncate text-sm font-semibold text-site-ink">
                {formatMoney(quote.total, "PYG")}
              </p>
              <p className="text-xs text-site-ink-muted">
                {quote.nights} noche{quote.nights === 1 ? "" : "s"}
              </p>
            </>
          ) : (
            <p className="truncate text-sm font-medium text-site-ink">
              {dateRangeLabel ?? "Elegir fechas"}
            </p>
          )}
        </button>

        {cta ?? (
          <button
            type="button"
            onClick={() => setShowCalendar(true)}
            className="btn-press inline-flex shrink-0 items-center gap-2 rounded-full bg-site-terracotta px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-site-terracotta-hover"
          >
            <CalendarIcon className="h-[18px] w-[18px]" />
            {quote?.status === "suggest" ? "Ver opciones" : "Fechas"}
          </button>
        )}
      </div>

      {showCalendar && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-site-ink/50 lg:hidden"
          onClick={() => setShowCalendar(false)}
        >
          <div
            className="flex max-h-[85vh] w-full flex-col gap-5 overflow-y-auto rounded-t-3xl bg-site-bg-elevated p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-site-border" />
            {calendar}
            {resultSection}
            {cta}
            {footerLines}
          </div>
        </div>
      )}
    </>
  );
}
