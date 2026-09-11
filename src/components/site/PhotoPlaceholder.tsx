import { HouseGlyph } from "./icons";

export function PhotoPlaceholder({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: "linear-gradient(155deg, rgba(157,101,64,0.28) 0%, rgba(75,90,52,0.22) 55%, #f2ede2 100%)",
      }}
    >
      <HouseGlyph className={`${className} text-site-ink/25`} />
    </div>
  );
}
