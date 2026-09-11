import type { Property } from "@/types/database";
import { amenityLabel } from "@/lib/amenities";
import { AMENITY_ICONS } from "./amenity-icons";
import { BathIcon, BedIcon, PeopleIcon, PinIcon } from "./icons";

type AmenitiesProperty = Pick<
  Property,
  "capacity" | "zone" | "bedrooms" | "beds" | "bathrooms" | "amenities"
>;

/**
 * Reemplaza la lista plana de comodidades por una grilla de 2 columnas con icono — capacidad,
 * zona, dormitorios, camas y baños primero (siempre presentes), despues las amenities cargadas.
 */
export function AmenitiesGrid({ property }: { property: AmenitiesProperty }) {
  const coreItems: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string }[] = [
    { icon: PeopleIcon, label: `Hasta ${property.capacity} personas` },
    { icon: PinIcon, label: property.zone },
  ];
  if (property.bedrooms !== null) {
    coreItems.push({
      icon: BedIcon,
      label: `${property.bedrooms} dormitorio${property.bedrooms === 1 ? "" : "s"}`,
    });
  }
  if (property.beds !== null) {
    coreItems.push({ icon: BedIcon, label: `${property.beds} cama${property.beds === 1 ? "" : "s"}` });
  }
  if (property.bathrooms !== null) {
    coreItems.push({
      icon: BathIcon,
      label: `${property.bathrooms} baño${property.bathrooms === 1 ? "" : "s"}`,
    });
  }

  const amenityItems = property.amenities.map((value) => ({
    icon: AMENITY_ICONS[value as keyof typeof AMENITY_ICONS],
    label: amenityLabel(value),
  }));

  const items = [...coreItems, ...amenityItems];

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:gap-x-10">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-site-terracotta-muted text-site-terracotta">
            {Icon ? <Icon className="h-5 w-5" /> : null}
          </span>
          <span className="text-sm font-medium text-site-ink">{label}</span>
        </div>
      ))}
    </div>
  );
}
