"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const BUCKET = "property-photos";

interface Photo {
  key: number;
  url: string | null;
  status: "done" | "uploading" | "error";
  previewUrl?: string;
  errorMessage?: string;
}

export function PhotoUploader({
  propertyId,
  defaultPhotos = [],
  onUploadingChange,
}: {
  propertyId: string;
  defaultPhotos?: { url: string }[];
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [photos, setPhotos] = useState<Photo[]>(() =>
    defaultPhotos.map((p, i) => ({ key: i, url: p.url, status: "done" as const }))
  );
  const nextKey = useRef(photos.length);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = photos.some((p) => p.status === "uploading");

  useEffect(() => {
    onUploadingChange?.(isUploading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploading]);

  useEffect(() => {
    return () => {
      for (const photo of photos) {
        if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadOne(key: number, file: File) {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const path = `${propertyId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
    });
    if (error) {
      setPhotos((prev) =>
        prev.map((p) => (p.key === key ? { ...p, status: "error", errorMessage: error.message } : p))
      );
      return;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    setPhotos((prev) =>
      prev.map((p) => (p.key === key ? { ...p, status: "done", url: data.publicUrl } : p))
    );
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        alert(`"${file.name}" no es una imagen válida.`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        alert(`"${file.name}" pesa más de 5MB.`);
        continue;
      }

      const key = nextKey.current++;
      setPhotos((prev) => [
        ...prev,
        { key, url: null, status: "uploading", previewUrl: URL.createObjectURL(file) },
      ]);
      uploadOne(key, file);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function remove(key: number) {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.key === key);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((p) => p.key !== key);
    });
  }

  function move(index: number, direction: -1 | 1) {
    setPhotos((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1.5 text-xs font-medium text-sb-cream-muted">
        Fotos (opcional) — la primera es la portada en el catálogo
      </legend>

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {photos.map((photo, index) => (
            <div key={photo.key} className="flex flex-col gap-1.5">
              {photo.status === "done" && photo.url && (
                <input type="hidden" name="photo_urls" value={photo.url} />
              )}
              <div className="relative h-24 w-24 overflow-hidden rounded-md border border-sb-border-subtle bg-sb-bg-elevated">
                {(photo.url || photo.previewUrl) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url ?? photo.previewUrl}
                    alt=""
                    className={`h-full w-full object-cover ${photo.status === "uploading" ? "opacity-50" : ""}`}
                  />
                )}
                {photo.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-sb-cream-muted">
                    Subiendo...
                  </div>
                )}
                {photo.status === "error" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-sb-danger/20 px-1 text-center text-[10px] text-sb-danger">
                    Error
                  </div>
                )}
                {index === 0 && photo.status === "done" && (
                  <span className="absolute bottom-0 left-0 right-0 bg-sb-bg/80 px-1 py-0.5 text-center text-[10px] text-sb-cream-muted">
                    Portada
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-sb-cream-muted">
                {photo.status === "done" && (
                  <>
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Mover antes"
                      className="disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === photos.length - 1}
                      aria-label="Mover despues"
                      className="disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => remove(photo.key)}
                  aria-label="Quitar foto"
                  className="text-sb-cream-muted hover:text-sb-danger"
                >
                  {photo.status === "error" ? "Quitar" : "×"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFilesSelected(e.target.files)}
        className="text-xs text-sb-cream-muted file:mr-3 file:rounded-md file:border file:border-sb-border-subtle file:bg-sb-bg-elevated file:px-3 file:py-1.5 file:text-xs file:text-sb-cream file:transition-colors hover:file:border-sb-border-accent"
      />
    </fieldset>
  );
}
