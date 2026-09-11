"use client";

import { useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { formatMoney } from "@/lib/currency";
import { convert } from "@/lib/exchange-rate";
import { buildBookingWhatsappLink } from "@/lib/whatsapp";
import { formatDateEs, fromISODate, toISODate } from "@/lib/dates";
import { isPropertyAvailable } from "@/lib/property-status";
import { CalendarIcon, WhatsappIcon } from "./icons";
import { WhatsappCtaLink } from "./WhatsappCtaLink";
import type { Property } from "@/types/database";

type BookingProperty = Pick<
  Property,
  | "id"
  | "code"
  | "name"
  | "whatsapp_message"
  | "status"
  | "min_nights"
  | "price_per_night"
  | "price_per_night_currency"
  | "price_per_week"
  | "price_per_week_currency"
  | "price_per_month"
  | "price_per_month_currency"
>;

export function BookingWidget({
  property,
  usdRate,
  blockedDates,
}: {
  property: BookingProperty;
  usdRate: number;
  blockedDates: string[];
}) {
  const available = isPropertyAvailable(property.status);
  const [range, setRange] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);

  const blockedDays = useMemo(() => blockedDates.map(fromISODate), [blockedDates]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Precio principal para el widget: preferimos por noche (la unidad mas chica y frecuente); si
  // no esta cargada, caemos a semana, despues a mes.
  const primary =
    property.price_per_night != null
      ? { amount: property.price_per_night, currency: property.price_per_night_currency, unit: "noche" as const }
      : property.price_per_week != null
        ? { amount: property.price_per_week, currency: property.price_per_week_currency, unit: "semana" as const }
        : property.price_per_month != null
          ? { amount: property.price_per_month, currency: property.price_per_month_currency, unit: "mes" as const }
          : null;

  const otherCurrency = primary ? (primary.currency === "PYG" ? "USD" : "PYG") : null;
  const approxOther =
    primary && otherCurrency ? convert(primary.amount, primary.currency, otherCurrency, usdRate) : null;

  // Un solo clic en el calendario deja from == to (rango de un dia) — no cuenta como seleccion
  // real todavia, esperamos el segundo clic del usuario.
  const hasRealRange = Boolean(range?.from && range?.to && range.to.getTime() !== range.from.getTime());

  const nights =
    hasRealRange && range?.from && range?.to
      ? Math.round((range.to.getTime() - range.from.getTime()) / 86400000)
      : null;

  const estimatedTotal = nights && primary && primary.unit === "noche" ? primary.amount * nights : null;

  const dateRangeLabel =
    hasRealRange && range?.from && range?.to
      ? `${formatDateEs(toISODate(range.from))} al ${formatDateEs(toISODate(range.to))}`
      : undefined;

  const whatsappHref = buildBookingWhatsappLink(property, dateRangeLabel);
  const ctaLabel = available ? "Consultar por WhatsApp" : "Consultar disponibilidad";

  const calendar = (
    <div className="site-calendar rounded-2xl border border-site-border bg-site-bg p-2">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={(next) => {
          setRange(next);
          // react-day-picker en modo rango arma {from, to} iguales con el primer clic — solo
          // cerramos cuando el rango ya tiene mas de un dia (segundo clic real del usuario).
          if (next?.from && next?.to && next.to.getTime() !== next.from.getTime()) {
            setShowCalendar(false);
          }
        }}
        disabled={[{ before: today }, ...blockedDays]}
        numberOfMonths={1}
      />
      {property.min_nights > 1 && (
        <p className="mt-2 px-2 text-xs text-site-ink-faint">
          Mínimo {property.min_nights} noches
        </p>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: tarjeta flotante sticky en la columna derecha */}
      <div className="hidden flex-col gap-5 rounded-3xl bg-site-bg-elevated p-6 shadow-[0_40px_80px_rgba(36,31,24,0.05)] lg:sticky lg:top-24 lg:flex">
        {primary ? (
          <div>
            <p className="font-display text-2xl font-semibold text-site-ink">
              {formatMoney(primary.amount, primary.currency)}
              <span className="text-sm font-normal text-site-ink-muted"> / {primary.unit}</span>
            </p>
            {approxOther !== null && otherCurrency && (
              <p className="mt-0.5 text-xs text-site-ink-faint">
                ≈ {formatMoney(approxOther, otherCurrency)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-lg font-medium text-site-ink">Consultar precio</p>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowCalendar((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-site-border px-4 py-3 text-left text-sm text-site-ink transition-colors hover:border-site-terracotta"
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-site-terracotta" />
            {dateRangeLabel ?? "Elegir fechas (opcional)"}
          </button>
          {showCalendar && calendar}
          {estimatedTotal !== null && (
            <p className="px-1 text-xs text-site-ink-muted">
              {nights} noche{nights === 1 ? "" : "s"} ≈ {formatMoney(estimatedTotal, primary!.currency)}
            </p>
          )}
        </div>

        <WhatsappCtaLink
          propertyId={property.id}
          href={whatsappHref}
          className="btn-press animate-pulse-glow inline-flex items-center justify-center gap-2 rounded-full bg-site-whatsapp px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-site-whatsapp-hover"
        >
          <WhatsappIcon className="h-[18px] w-[18px]" />
          {ctaLabel}
        </WhatsappCtaLink>
        <p className="text-center text-xs text-site-ink-faint">
          Sin costo de reserva · respuesta directa del equipo
        </p>
      </div>

      {/* Mobile: barra fija abajo, con el CTA siempre a mano del pulgar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 bg-site-bg-elevated/95 px-4 py-3 shadow-[0_-16px_40px_rgba(36,31,24,0.08)] backdrop-blur-md lg:hidden">
        <div className="min-w-0 flex-1">
          {primary ? (
            <p className="truncate text-sm font-semibold text-site-ink">
              {formatMoney(primary.amount, primary.currency)}
              <span className="font-normal text-site-ink-muted"> / {primary.unit}</span>
            </p>
          ) : (
            <p className="text-sm font-medium text-site-ink">Consultar precio</p>
          )}
          <button
            type="button"
            onClick={() => setShowCalendar((v) => !v)}
            className="text-xs text-site-terracotta"
          >
            {dateRangeLabel ?? "Elegir fechas"}
          </button>
        </div>
        <WhatsappCtaLink
          propertyId={property.id}
          href={whatsappHref}
          className="btn-press inline-flex shrink-0 items-center gap-2 rounded-full bg-site-whatsapp px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-site-whatsapp-hover"
        >
          <WhatsappIcon className="h-[18px] w-[18px]" />
          WhatsApp
        </WhatsappCtaLink>
      </div>

      {showCalendar && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-site-ink/50 lg:hidden"
          onClick={() => setShowCalendar(false)}
        >
          <div
            className="w-full rounded-t-3xl bg-site-bg-elevated p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-site-border" />
            {calendar}
          </div>
        </div>
      )}
    </>
  );
}
