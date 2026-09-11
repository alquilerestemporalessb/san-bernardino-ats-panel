"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./icons";

export function Lightbox({
  photos,
  index,
  name,
  onClose,
  onNavigate,
}: {
  photos: { url: string }[];
  index: number;
  name: string;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const goPrev = () => onNavigate((index - 1 + photos.length) % photos.length);
  const goNext = () => onNavigate((index + 1) % photos.length);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Precarga la foto anterior y la siguiente (ademas de la actual) para que avanzar con las
  // flechas sea instantaneo — antes cada clic montaba una <Image> nueva desde cero y se notaba
  // la descarga como un trabon. Con solo 3 fotos "vivas" a la vez no se paga el costo de bajar
  // la galeria entera si el visitante nunca llega a recorrerla completa.
  const prevIndex = (index - 1 + photos.length) % photos.length;
  const nextIndex = (index + 1) % photos.length;
  const slides =
    photos.length > 1
      ? [
          { slot: "prev" as const, photoIndex: prevIndex },
          { slot: "current" as const, photoIndex: index },
          { slot: "next" as const, photoIndex: nextIndex },
        ]
      : [{ slot: "current" as const, photoIndex: index }];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-site-ink/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de fotos — ${name}`}
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-5 py-4 text-white/80">
        <span className="text-sm">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar galería"
          className="btn-press rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
        <div
          className="relative h-full w-full max-w-5xl"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map(({ slot, photoIndex }) => (
            <Image
              key={slot}
              src={photos[photoIndex].url}
              alt={`${name} — foto ${photoIndex + 1}`}
              fill
              sizes="100vw"
              priority={slot === "current"}
              loading={slot === "current" ? undefined : "eager"}
              className={`object-contain transition-opacity duration-200 ${
                slot === "current" ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Foto anterior"
              className="btn-press absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 sm:left-6"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Foto siguiente"
              className="btn-press absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 sm:right-6"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
