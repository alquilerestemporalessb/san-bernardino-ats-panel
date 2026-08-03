import Image from "next/image";
import { InstagramIcon, TiktokIcon } from "./icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-sb-bg-sunken py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/isotype.png" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-sm text-sb-cream">San Bernardino</span>
              <span className="text-[0.55rem] uppercase tracking-[0.18em] text-sb-cream-faint">
                Alquileres Temporales
              </span>
            </span>
          </div>

          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/alquilertemporal_sanber"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sb-border-subtle text-sb-cream transition-colors hover:border-sb-border-accent hover:text-sb-accent"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href="https://www.tiktok.com/@alquiler.temporal.san.bernardino"
              target="_blank"
              rel="noopener"
              aria-label="TikTok"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sb-border-subtle text-sb-cream transition-colors hover:border-sb-border-accent hover:text-sb-accent"
            >
              <TiktokIcon className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-sb-border-subtle pt-6 text-xs text-sb-cream-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} San Bernardino — Alquileres Temporales. San Bernardino, Paraguay.</span>
          <span>Todas las reservas se coordinan directamente por WhatsApp.</span>
        </div>
      </div>
    </footer>
  );
}
