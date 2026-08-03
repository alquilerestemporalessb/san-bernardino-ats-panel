export const AMENITIES = [
  { value: "piscina", label: "Pileta" },
  { value: "wifi", label: "WiFi" },
  { value: "aire_acondicionado", label: "Aire acondicionado" },
  { value: "parrilla", label: "Parrilla" },
  { value: "cochera", label: "Cochera" },
  { value: "acepta_mascotas", label: "Acepta mascotas" },
  { value: "ropa_de_cama", label: "Ropa de cama incluida" },
  { value: "acceso_lago", label: "Acceso al lago" },
] as const;

export type AmenityValue = (typeof AMENITIES)[number]["value"];

const AMENITY_LABELS = new Map<string, string>(AMENITIES.map((a) => [a.value, a.label]));

export function amenityLabel(value: string): string {
  return AMENITY_LABELS.get(value) ?? value;
}
