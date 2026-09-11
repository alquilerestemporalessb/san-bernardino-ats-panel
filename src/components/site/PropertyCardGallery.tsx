"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const CYCLE_MS = 1100;
const MAX_PHOTOS = 5;

/**
 * Reemplaza la imagen fija y estatica de la tarjeta: al pasar el mouse, rota entre las primeras
 * fotos de la propiedad (crossfade) con puntitos indicadores arriba. Sin drag/swipe — en mobile no
 * hay hover, asi que ahi se ve simplemente la primera foto (comportamiento anterior).
 */
export function PropertyCardGallery({
  photos,
  alt,
}: {
  photos: { url: string }[];
  alt: string;
}) {
  const shown = photos.slice(0, MAX_PHOTOS);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    if (shown.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % shown.length);
    }, CYCLE_MS);
  }

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIndex(0);
  }

  useEffect(() => () => stop(), []);

  return (
    <div className="absolute inset-0" onMouseEnter={start} onMouseLeave={stop}>
      {shown.map((photo, i) => (
        <Image
          key={photo.url}
          src={photo.url}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 95vw"
          className={`object-cover transition-opacity duration-500 ease-out group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-500 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {shown.length > 1 && (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex gap-1">
          {shown.map((photo, i) => (
            <span
              key={photo.url}
              className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                i === index ? "bg-white" : "bg-white/35"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
