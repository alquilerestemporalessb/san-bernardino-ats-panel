import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, TiktokIcon } from "./icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-site-ink py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-6">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/isotype.png" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-sm font-semibold text-site-bg">San Bernardino</span>
              <span className="text-[0.55rem] uppercase tracking-[0.18em] text-site-bg/50">
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-site-bg/15 text-site-bg transition-colors hover:border-site-terracotta hover:text-site-terracotta"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href="https://www.tiktok.com/@alquiler.temporal.san.bernardino"
              target="_blank"
              rel="noopener"
              aria-label="TikTok"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-site-bg/15 text-site-bg transition-colors hover:border-site-terracotta hover:text-site-terracotta"
            >
              <TiktokIcon className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-[0.65rem] tracking-[0.05em] text-site-bg/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} San Bernardino — Alquileres Temporales. San Bernardino, Paraguay.</span>
          <div className="flex items-center gap-4">
            <span>Todas las reservas se coordinan directamente por WhatsApp.</span>
            <Link href="/admin" className="text-site-bg/30 transition-colors hover:text-site-bg/55">
              Acceso equipo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
