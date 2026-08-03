const formatter = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  maximumFractionDigits: 0,
});

export function formatGs(amount: number): string {
  return formatter.format(amount);
}
