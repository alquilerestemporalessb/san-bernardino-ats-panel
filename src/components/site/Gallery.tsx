"use client";

import { useState } from "react";
import Image from "next/image";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { Lightbox } from "./Lightbox";

const MAX_GRID_TILES = 5;

function GalleryTile({
  photo,
  index,
  total,
  name,
  onOpen,
  className,
  sizes,
  overlay,
}: {
  photo: { url: string };
  index: number;
  total: number;
  name: string;
  onOpen: (index: number) => void;
  className: string;
  sizes: string;
  overlay?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`Ver foto ${index + 1} de ${total}`}
      className={`group relative block overflow-hidden ${className}`}
    >
      <Image
        src={photo.url}
        alt={`${name} — foto ${index + 1}`}
        fill
        sizes={sizes}
        priority={index === 0}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {overlay}
    </button>
  );
}

export function Gallery({ photos, name }: { photos: { url: string }[]; name: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="aspect-[16/9] w-full overflow-hidden rounded-3xl">
        <PhotoPlaceholder className="h-20 w-20" />
      </div>
    );
  }

  const extra = photos.length - MAX_GRID_TILES;
  const shown = photos.slice(0, MAX_GRID_TILES);

  return (
    <>
      {shown.length === 1 && (
        <div className="h-[340px] w-full overflow-hidden rounded-3xl shadow-[0_20px_45px_rgba(36,31,24,0.12)] sm:h-[440px]">
          <GalleryTile
            photo={shown[0]}
            index={0}
            total={photos.length}
            name={name}
            onOpen={setOpenIndex}
            className="h-full w-full"
            sizes="(min-width: 1024px) 900px, 100vw"
          />
        </div>
      )}

      {shown.length >= 2 && (
        <div className="sm:hidden">
          <div className="relative h-[280px] w-full overflow-hidden rounded-3xl shadow-[0_20px_45px_rgba(36,31,24,0.12)]">
            <GalleryTile
              photo={shown[0]}
              index={0}
              total={photos.length}
              name={name}
              onOpen={setOpenIndex}
              className="h-full w-full"
              sizes="100vw"
              overlay={
                <span className="absolute bottom-3 right-3 rounded-full bg-site-ink/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  Ver las {photos.length} fotos
                </span>
              }
            />
          </div>
        </div>
      )}

      {shown.length >= 2 && shown.length <= 4 && (
        <div className="hidden h-[340px] grid-cols-2 gap-2 overflow-hidden rounded-3xl shadow-[0_20px_45px_rgba(36,31,24,0.12)] sm:grid sm:h-[440px]">
          <GalleryTile
            photo={shown[0]}
            index={0}
            total={photos.length}
            name={name}
            onOpen={setOpenIndex}
            className="h-full w-full"
            sizes="(min-width: 1024px) 450px, 50vw"
          />
          <div
            className={`grid h-full gap-2 ${
              shown.length === 2 ? "" : shown.length === 3 ? "grid-rows-2" : "grid-rows-3"
            }`}
          >
            {shown.slice(1).map((photo, i) => (
              <GalleryTile
                key={photo.url}
                photo={photo}
                index={i + 1}
                total={photos.length}
                name={name}
                onOpen={setOpenIndex}
                className="h-full w-full"
                sizes="(min-width: 1024px) 450px, 50vw"
              />
            ))}
          </div>
        </div>
      )}

      {shown.length >= 5 && (
        <div className="hidden h-[340px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl shadow-[0_20px_45px_rgba(36,31,24,0.12)] sm:grid sm:h-[440px]">
          <GalleryTile
            photo={shown[0]}
            index={0}
            total={photos.length}
            name={name}
            onOpen={setOpenIndex}
            className="col-span-2 row-span-2 h-full w-full"
            sizes="(min-width: 1024px) 620px, 100vw"
          />
          {[1, 2, 3, 4].map((i) => (
            <GalleryTile
              key={shown[i].url}
              photo={shown[i]}
              index={i}
              total={photos.length}
              name={name}
              onOpen={setOpenIndex}
              className="h-full w-full"
              sizes="(min-width: 1024px) 300px, 50vw"
              overlay={
                i === 4 && extra > 0 ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-site-ink/55 text-lg font-semibold text-white">
                    +{extra} fotos
                  </span>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      {openIndex !== null && (
        <Lightbox
          photos={photos}
          index={openIndex}
          name={name}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  );
}
