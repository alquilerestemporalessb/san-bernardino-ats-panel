"use client";

import { useState } from "react";
import Image from "next/image";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function Gallery({ photos, name }: { photos: { url: string }[]; name: string }) {
  const [selected, setSelected] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="aspect-[16/10] w-full overflow-hidden rounded-3xl">
        <PhotoPlaceholder className="h-20 w-20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-site-bg-sunken shadow-[0_20px_45px_rgba(36,31,24,0.12)]">
        <Image
          src={photos[selected].url}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover"
        />
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <button
              key={photo.url + index}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Ver foto ${index + 1}`}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                index === selected
                  ? "border-site-terracotta"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={photo.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
