"use client";

import { useEffect, useRef, useState } from "react";

interface ExistingPhoto {
  key: number;
  url: string;
}

interface NewPhoto {
  key: number;
  file: File;
  previewUrl: string;
}

export function PhotoUploader({ defaultPhotos = [] }: { defaultPhotos?: { url: string }[] }) {
  const [existing, setExisting] = useState<ExistingPhoto[]>(() =>
    defaultPhotos.map((p, i) => ({ key: i, url: p.url }))
  );

  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);
  const nextNewKey = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      for (const photo of newPhotos) URL.revokeObjectURL(photo.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function syncFileInput(photos: NewPhoto[]) {
    const dt = new DataTransfer();
    for (const photo of photos) dt.items.add(photo.file);
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const added = Array.from(files).map((file) => ({
      key: nextNewKey.current++,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    const updated = [...newPhotos, ...added];
    setNewPhotos(updated);
    syncFileInput(updated);
  }

  function removeNewPhoto(key: number) {
    const removed = newPhotos.find((p) => p.key === key);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    const updated = newPhotos.filter((p) => p.key !== key);
    setNewPhotos(updated);
    syncFileInput(updated);
  }

  function moveExisting(index: number, direction: -1 | 1) {
    setExisting((rows) => {
      const target = index + direction;
      if (target < 0 || target >= rows.length) return rows;
      const copy = [...rows];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  function removeExisting(key: number) {
    setExisting((rows) => rows.filter((r) => r.key !== key));
  }

  const isCoverPhoto = existing.length === 0 && newPhotos.length > 0;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1.5 text-xs font-medium text-sb-cream-muted">
        Fotos (opcional) — la primera es la portada en el catálogo
      </legend>

      {existing.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-sb-cream-faint">Fotos actuales</p>
          <div className="flex flex-wrap gap-3">
            {existing.map((photo, index) => (
              <div key={photo.key} className="flex flex-col gap-1.5">
                <input type="hidden" name="existing_photo_urls" value={photo.url} />
                <div className="relative h-24 w-24 overflow-hidden rounded-md border border-sb-border-subtle">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-sb-bg/80 px-1 py-0.5 text-center text-[10px] text-sb-cream-muted">
                      Portada
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-sb-cream-muted">
                  <button
                    type="button"
                    onClick={() => moveExisting(index, -1)}
                    disabled={index === 0}
                    aria-label="Mover antes"
                    className="disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveExisting(index, 1)}
                    disabled={index === existing.length - 1}
                    aria-label="Mover despues"
                    className="disabled:opacity-30"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExisting(photo.key)}
                    aria-label="Quitar foto"
                    className="text-sb-cream-muted hover:text-sb-danger"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-xs text-sb-cream-faint">Fotos nuevas</p>
        {newPhotos.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {newPhotos.map((photo, index) => (
              <div key={photo.key} className="flex flex-col gap-1.5">
                <div className="relative h-24 w-24 overflow-hidden rounded-md border border-sb-border-subtle">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
                  {isCoverPhoto && index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-sb-bg/80 px-1 py-0.5 text-center text-[10px] text-sb-cream-muted">
                      Portada
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeNewPhoto(photo.key)}
                  aria-label="Quitar foto"
                  className="self-center text-xs text-sb-cream-muted hover:text-sb-danger"
                >
                  × Quitar
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          name="new_photos"
          multiple
          accept="image/*"
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="text-xs text-sb-cream-muted file:mr-3 file:rounded-md file:border file:border-sb-border-subtle file:bg-sb-bg-elevated file:px-3 file:py-1.5 file:text-xs file:text-sb-cream file:transition-colors hover:file:border-sb-border-accent"
        />
      </div>
    </fieldset>
  );
}
