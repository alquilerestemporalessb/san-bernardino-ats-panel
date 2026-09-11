import type { AmenityValue } from "@/lib/amenities";
import {
  PoolIcon,
  WifiIcon,
  SnowflakeIcon,
  GrillIcon,
  CarIcon,
  PawIcon,
  LinenIcon,
  WavesIcon,
} from "./icons";

/** Un icono por cada amenity — usado en la grilla de comodidades de la ficha de propiedad. */
export const AMENITY_ICONS: Record<AmenityValue, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  piscina: PoolIcon,
  wifi: WifiIcon,
  aire_acondicionado: SnowflakeIcon,
  parrilla: GrillIcon,
  cochera: CarIcon,
  acepta_mascotas: PawIcon,
  ropa_de_cama: LinenIcon,
  acceso_lago: WavesIcon,
};
