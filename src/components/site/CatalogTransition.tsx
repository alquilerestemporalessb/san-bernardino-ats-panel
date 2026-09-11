"use client";

import { createContext, useContext, useTransition } from "react";

/**
 * Comparte el estado de "aplicando filtros" entre FilterBar (que dispara la navegacion) y la
 * grilla de resultados (que se desvanece mientras el Server Component vuelve a renderizar) — sin
 * esto, cambiar un filtro reemplaza la grilla de golpe (parpadeo). Con esto, el contenido viejo se
 * atenua con una transicion de opacidad hasta que llega el nuevo.
 */
const CatalogTransitionContext = createContext<{
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
} | null>(null);

export function CatalogTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <CatalogTransitionContext.Provider value={{ isPending, startTransition }}>
      {children}
    </CatalogTransitionContext.Provider>
  );
}

export function useCatalogTransition() {
  const ctx = useContext(CatalogTransitionContext);
  // Fuera del provider (no deberia pasar, pero por las dudas) cae a un no-op sin transicion.
  return ctx ?? { isPending: false, startTransition: (fn: () => void) => fn() };
}

export function CatalogFade({ children }: { children: React.ReactNode }) {
  const { isPending } = useCatalogTransition();
  return (
    <div
      className={`transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}
    >
      {children}
    </div>
  );
}
