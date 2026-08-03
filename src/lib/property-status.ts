import type { PropertyStatus } from "@/types/database";

export const STATUS_BADGE_LABELS: Partial<Record<PropertyStatus, string>> = {
  reservada: "Reservada",
  alquilada_temporada: "Alquilada esta temporada",
};

export function isPropertyAvailable(status: PropertyStatus) {
  return status === "disponible";
}
