import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Panel Admin",
};

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-sb-border-subtle bg-sb-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/isotype.png" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-sm text-sb-cream">San Bernardino</span>
              <span className="text-[0.55rem] tracking-[0.16em] text-sb-cream-faint uppercase">
                Panel Admin ATS
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-medium text-sb-cream-muted hover:text-sb-cream"
            >
              Ver sitio público ↗
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-sb-border-subtle px-3.5 py-1.5 text-xs font-medium text-sb-cream-muted transition-colors hover:border-sb-border-accent hover:text-sb-cream"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
