import { HouseGlyph } from "./icons";

export function PhotoPlaceholder({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: "linear-gradient(155deg, rgba(157,101,64,0.35) 0%, rgba(14,28,41,0.9) 55%, #0e1c29 100%)",
      }}
    >
      <HouseGlyph className={`${className} text-sb-cream/25`} />
    </div>
  );
}
