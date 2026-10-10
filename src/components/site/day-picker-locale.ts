import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DayPickerProps } from "react-day-picker";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Calendario del sitio publico en espanol (meses y dias de la semana). El panel admin
 * (AvailabilityCalendar) no usa esto y sigue con el locale por defecto de react-day-picker.
 * date-fns da los nombres de mes/dia en minuscula para es-* (ortografia correcta) — los
 * capitalizamos solo para la cabecera y los dias, que es donde se ven como titulo.
 */
export const dayPickerEsProps: Pick<DayPickerProps, "locale" | "weekStartsOn" | "formatters"> = {
  locale: es,
  // El locale es-* por defecto arranca la semana en lunes; mantenemos domingo primero (el orden
  // que ya tenia el calendario en ingles) para no reordenar columnas, solo traducir.
  weekStartsOn: 0,
  formatters: {
    formatCaption: (month) => capitalize(format(month, "LLLL yyyy", { locale: es })),
    formatWeekdayName: (weekday) => capitalize(format(weekday, "cccccc", { locale: es })),
  },
};
