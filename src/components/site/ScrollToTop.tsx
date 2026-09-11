"use client";

import { useLayoutEffect } from "react";

// El <Link> de esta version de Next mantiene la posicion de scroll si la pagina de origen
// seguia visible en el viewport (p.ej. veniamos scrolleados a mitad del catalogo), en vez de
// resetear siempre al tope como antes — asi que la ficha de la propiedad abria a mitad de pagina.
export function ScrollToTop() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}
