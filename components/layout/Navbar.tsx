"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useMemo, useState } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdminArea = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  const navItems = useMemo(
    () => [
      { href: "/", label: "Início", show: !isAdminArea },
      { href: "/agendar", label: "Agendar", show: !isAdminArea },
    ],
    [isAdminArea]
  );

  const adminItems = useMemo(
    () => [
      { href: "/admin", label: "Dashboard", show: isAdminArea },
      { href: "/admin/barbeiros", label: "Barbeiros", show: isAdminArea },
      { href: "/admin/horarios", label: "Horários", show: isAdminArea },
      { href: "/admin/servicos", label: "Serviços", show: isAdminArea },
        { href: "/admin/agendamentos", label: "Agendamentos", show: isAdminArea },
    ],
    [isAdminArea]
  );

  const itemsToRender = isAdminArea
    ? adminItems.filter((i) => i.show)
    : navItems.filter((i) => i.show);

  // Fecha menu ao navegar
  useLayoutEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  // Não renderiza navbar na tela de login admin
  if (isAdminLogin) return null;

  return (
    <header className="sticky top-0 z-50">
      {/* Camada premium */}
      <div className="border-b border-black/10 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link
              href={isAdminArea ? "/admin" : "/"}
              className="group inline-flex items-center gap-2"
              aria-label="Home"
            >
              <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white shadow-sm">
                <span className="h-2 w-2 rounded-full bg-black" />
                <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">
                  {isAdminArea ? "Barbearia Admin" : "Barbearia"}
                </div>
                <div className="text-[11px] opacity-60">
                  {isAdminArea ? "Painel administrativo" : "Agendamento online"}
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
            {itemsToRender.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-black text-white"
                      : "text-black/70 hover:bg-black/5 hover:text-black"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isAdminArea && (
              <>
                <Link
                  href="/admin/login"
                  className="hidden rounded-lg border border-black/10 px-3 py-2 text-sm text-black/70 transition hover:border-black/30 hover:text-black md:inline-flex"
                >
                  Admin
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-black/80 shadow-sm transition hover:border-black/25 hover:text-black md:hidden"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cx(
            "md:hidden",
            mobileOpen ? "block" : "hidden"
          )}
        >
          <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
            <div className="rounded-2xl border border-black/10 bg-white p-2 shadow-sm">
              <div className="flex flex-col">
                {itemsToRender.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cx(
                        "rounded-xl px-3 py-3 text-sm transition",
                        active
                          ? "bg-black text-white"
                          : "text-black/70 hover:bg-black/5 hover:text-black"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {!isAdminArea && (
                  <div className="mt-2 grid gap-2 border-t border-black/10 pt-2">
                    <Link
                      href="/agendar"
                      className="rounded-xl bg-black px-3 py-3 text-center text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Agendar
                    </Link>
                    <Link
                      href="/admin/login"
                      className="rounded-xl border border-black/10 px-3 py-3 text-center text-sm text-black/70 transition hover:border-black/30 hover:text-black"
                    >
                      Admin
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linha sutil (premium) */}
      <div className="pointer-events-none h-px w-full bg-linear-to-r from-transparent via-black/10 to-transparent" />
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}