"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { createBooking, type BookingFormState } from "@/lib/actions/bookings";
import { toISODate, fromISODate } from "@/lib/dates";

const initialState: BookingFormState = {};

export function BookingForm({
  propertyId,
  blockedDates,
}: {
  propertyId: string;
  blockedDates: string[];
}) {
  const [state, formAction, pending] = useActionState(
    createBooking.bind(null, propertyId),
    initialState
  );
  const [range, setRange] = useState<DateRange | undefined>();
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const blockedDays = useMemo(() => blockedDates.map(fromISODate), [blockedDates]);

  useEffect(() => {
    if (submittedRef.current && !pending && !state.error) {
      formRef.current?.reset();
      setRange(undefined);
      submittedRef.current = false;
    }
  }, [state, pending]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={() => {
        submittedRef.current = true;
      }}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="check_in" value={range?.from ? toISODate(range.from) : ""} />
      <input type="hidden" name="check_out" value={range?.to ? toISODate(range.to) : ""} />

      <div className="self-start rounded-xl border border-sb-border-subtle bg-sb-bg-elevated p-3">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={[{ before: today }, ...blockedDays]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Huesped" htmlFor="guest_name">
          <input id="guest_name" name="guest_name" required className={inputClass} />
        </Field>
        <Field label="Contacto (opcional)" htmlFor="guest_contact">
          <input
            id="guest_contact"
            name="guest_contact"
            placeholder="Telefono / WhatsApp"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Monto acordado (Gs.)" htmlFor="amount">
          <input
            id="amount"
            name="amount"
            type="number"
            min={0}
            step="1"
            required
            className={inputClass}
          />
        </Field>
        <Field label="Comision ATS (%)" htmlFor="commission_pct">
          <input
            id="commission_pct"
            name="commission_pct"
            type="number"
            min={0}
            max={100}
            step="0.1"
            defaultValue={10}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Notas (opcional)" htmlFor="notes">
        <textarea id="notes" name="notes" rows={2} className={inputClass} />
      </Field>

      {state?.error && (
        <p role="alert" className="text-sm text-sb-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !range?.from || !range?.to}
        className="self-start rounded-md bg-sb-accent px-5 py-2.5 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Registrar reserva"}
      </button>
    </form>
  );
}

const inputClass =
  "rounded-md border border-sb-border-subtle bg-sb-bg-elevated px-3.5 py-2.5 text-sm text-sb-cream outline-none focus:border-sb-border-accent";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-sb-cream-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
