"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo / Nome */}
        <Link href="/" className="text-lg font-semibold">
          Barbearia
        </Link>

        {/* Ações */}
        <nav className="flex items-center gap-4">
          {!isAdmin && (
            <>
              <Link
                href="/agendar"
                className="text-sm opacity-80 hover:opacity-100"
              >
                Agendar
              </Link>

              <Link
                href="/admin"
                className="rounded-lg border border-black/10 px-4 py-2 text-sm transition hover:border-black/30"
              >
                Admin
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm opacity-80 hover:opacity-100"
            >
              Dashboard
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}