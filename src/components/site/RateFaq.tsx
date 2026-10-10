/** Pregunta fija sobre el calendario de tarifas — una sola, no justifica un acordeon. */
export function RateFaq() {
  return (
    <div className="max-w-prose">
      <h3 className="font-display text-lg text-site-ink">¿El precio publicado es el total?</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-site-ink-muted">
        Sí, es el valor de la estadía, sin cargos adicionales de la plataforma. Aparte se abona
        una garantía reembolsable.
      </p>
    </div>
  );
}
