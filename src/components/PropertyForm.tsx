"use client";

import { useActionState, useState } from "react";
import { PhotoUploader } from "@/components/PhotoUploader";
import type { PropertyFormState } from "@/lib/actions/properties";
import type { Property } from "@/types/database";
import { AMENITIES } from "@/lib/amenities";

const initialState: PropertyFormState = {};

interface PropertyFormProps {
  action: (prevState: PropertyFormState, formData: FormData) => Promise<PropertyFormState>;
  defaultValues?: Partial<Property> & {
    photos?: { url: string }[];
    owner?: { owner_name: string; owner_contact: string | null };
  };
  submitLabel: string;
}

export function PropertyForm({ action, defaultValues, submitLabel }: PropertyFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [propertyId] = useState(() => defaultValues?.id ?? crypto.randomUUID());
  const [photosUploading, setPhotosUploading] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={propertyId} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Codigo" htmlFor="code">
          <input
            id="code"
            name="code"
            required
            placeholder="SB-001"
            defaultValue={defaultValues?.code}
            className={inputClass}
          />
        </Field>

        <Field label="Capacidad (personas)" htmlFor="capacity">
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.capacity}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Nombre" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          placeholder="Casa del Lago"
          defaultValue={defaultValues?.name}
          className={inputClass}
        />
      </Field>

      <Field label="Zona" htmlFor="zone">
        <input
          id="zone"
          name="zone"
          required
          placeholder="Playa Mora"
          defaultValue={defaultValues?.zone}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Precio por noche en Gs. (opcional)" htmlFor="price_per_night">
          <input
            id="price_per_night"
            name="price_per_night"
            type="number"
            min={0}
            step="1"
            placeholder="450000"
            defaultValue={defaultValues?.price_per_night ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Minimo de noches (para alquiler por noche)" htmlFor="min_nights">
          <input
            id="min_nights"
            name="min_nights"
            type="number"
            min={1}
            step="1"
            defaultValue={defaultValues?.min_nights ?? 1}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Precio por semana en Gs. (opcional)" htmlFor="price_per_week">
          <input
            id="price_per_week"
            name="price_per_week"
            type="number"
            min={0}
            step="1"
            placeholder="2500000"
            defaultValue={defaultValues?.price_per_week ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Precio por mes en Gs. (opcional)" htmlFor="price_per_month">
          <input
            id="price_per_month"
            name="price_per_month"
            type="number"
            min={0}
            step="1"
            placeholder="8000000"
            defaultValue={defaultValues?.price_per_month ?? ""}
            className={inputClass}
          />
        </Field>
      </div>
      <p className="-mt-3 text-xs text-sb-cream-faint">
        Cargá cualquier combinación de precios según cómo se alquile la propiedad — si solo alquilás
        por mes (ej. enero), dejá el precio por noche vacío.
      </p>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Dormitorios (opcional)" htmlFor="bedrooms">
          <input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min={0}
            step="1"
            defaultValue={defaultValues?.bedrooms ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Camas (opcional)" htmlFor="beds">
          <input
            id="beds"
            name="beds"
            type="number"
            min={0}
            step="1"
            defaultValue={defaultValues?.beds ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Banos (opcional)" htmlFor="bathrooms">
          <input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min={0}
            step="1"
            defaultValue={defaultValues?.bathrooms ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-medium text-sb-cream-muted">
          Comodidades (opcional)
        </legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {AMENITIES.map((amenity) => (
            <label key={amenity.value} className="flex items-center gap-2 text-sm text-sb-cream-muted">
              <input
                type="checkbox"
                name="amenities"
                value={amenity.value}
                defaultChecked={defaultValues?.amenities?.includes(amenity.value)}
                className="h-4 w-4 rounded border-sb-border-subtle accent-sb-accent"
              />
              {amenity.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Tour virtual / video (opcional)" htmlFor="tour_url">
        <input
          id="tour_url"
          name="tour_url"
          type="url"
          placeholder="https://poly.cam/... o link de YouTube"
          defaultValue={defaultValues?.tour_url ?? ""}
          className={inputClass}
        />
      </Field>
      <p className="-mt-3 text-xs text-sb-cream-faint">
        Link embebible de un tour 3D (ej. Polycam) o un video — se muestra como sección aparte en la
        página de la propiedad.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Latitud (opcional)" htmlFor="latitude">
          <input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            placeholder="-25.32"
            defaultValue={defaultValues?.latitude ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Longitud (opcional)" htmlFor="longitude">
          <input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            placeholder="-57.28"
            defaultValue={defaultValues?.longitude ?? ""}
            className={inputClass}
          />
        </Field>
      </div>
      <p className="-mt-3 text-xs text-sb-cream-faint">
        Para ubicar la propiedad en el mapa: clic derecho sobre el punto en Google Maps → copiar las
        coordenadas y pegarlas acá.
      </p>

      <PhotoUploader
        propertyId={propertyId}
        defaultPhotos={defaultValues?.photos}
        onUploadingChange={setPhotosUploading}
      />

      <fieldset className="flex flex-col gap-3 rounded-md border border-sb-border-subtle p-4">
        <legend className="px-1 text-xs font-medium text-sb-cream-muted">
          Datos del propietario (uso interno, no se muestra en el sitio público)
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre del propietario (opcional)" htmlFor="owner_name">
            <input
              id="owner_name"
              name="owner_name"
              placeholder="Nombre y apellido"
              defaultValue={defaultValues?.owner?.owner_name ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Contacto del propietario (opcional)" htmlFor="owner_contact">
            <input
              id="owner_contact"
              name="owner_contact"
              placeholder="Telefono / WhatsApp"
              defaultValue={defaultValues?.owner?.owner_contact ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
      </fieldset>

      <Field label="Descripcion (opcional)" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Mensaje de WhatsApp personalizado (opcional)" htmlFor="whatsapp_message">
        <textarea
          id="whatsapp_message"
          name="whatsapp_message"
          rows={2}
          placeholder="Si se deja vacio, la landing usa el mensaje generico con el codigo y nombre."
          defaultValue={defaultValues?.whatsapp_message ?? ""}
          className={inputClass}
        />
      </Field>

      {state?.error && (
        <p role="alert" className="text-sm text-sb-danger">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || photosUploading}
          className="rounded-md bg-sb-accent px-5 py-2.5 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover disabled:opacity-60"
        >
          {pending ? "Guardando..." : photosUploading ? "Subiendo fotos..." : submitLabel}
        </button>
      </div>
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
