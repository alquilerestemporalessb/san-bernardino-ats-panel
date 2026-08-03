"use client";

import { useState } from "react";
import Image from "next/image";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function Gallery({ photos, name }: { photos: { url: string }[]; name: string }) {
  const [selected, setSelected] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl">
        <PhotoPlaceholder className="h-20 w-20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-sb-bg-elevated">
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
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border transition-colors ${
                index === selected
                  ? "border-sb-accent"
                  : "border-sb-border-subtle hover:border-sb-border-accent"
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
