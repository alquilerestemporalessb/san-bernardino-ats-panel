import Image from "next/image";
import Link from "next/link";
import { buildGenericWhatsappLink } from "@/lib/whatsapp";
import { WhatsappIcon } from "./icons";

const links = [
  { href: "#catalogo", label: "Propiedades" },
  { href: "#confianza", label: "Cómo funciona" },
  { href: "#propietarios", label: "Propietarios" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-sb-border-subtle bg-sb-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="#top" className="flex items-center gap-3">
          <Image src="/isotype.png" alt="" width={32} height={32} className="h-8 w-8" />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-base text-sb-cream">San Bernardino</span>
            <span className="text-[0.55rem] tracking-[0.18em] text-sb-cream-faint uppercase">
              Alquileres Temporales
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-sb-cream-muted transition-colors hover:text-sb-cream"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={buildGenericWhatsappLink("Hola, quiero consultar por una casa en San Bernardino.")}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 rounded-md bg-sb-accent px-4 py-2 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover"
        >
          <WhatsappIcon className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </header>
  );
}
