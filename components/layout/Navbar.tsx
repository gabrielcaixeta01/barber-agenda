"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { logoutAdmin } from "@/app/admin/actions";
import {
  Calendar,
  ClipboardList,
  Grid2X2,
  Home,
  LogOut,
  Menu,
  Scissors,
  Tag,
  User,
  X,
} from "lucide-react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type NavItem = {
  href: string;
  label: string;
  show: boolean;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const isAdminArea = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  const navItems: NavItem[] = useMemo(
    () => [
      { href: "/", label: "Início", show: !isAdminArea, Icon: Home },
      { href: "/agendar", label: "Agendar", show: !isAdminArea, Icon: Calendar },
    ],
    [isAdminArea]
  );

  const adminItems: NavItem[] = useMemo(
    () => [
      { href: "/admin/dashboard", label: "Dashboard", show: isAdminArea, Icon: Grid2X2 },
      { href: "/admin/agendamentos", label: "Agendamentos", show: isAdminArea, Icon: ClipboardList },
      { href: "/admin/barbeiros", label: "Barbeiros", show: isAdminArea, Icon: Scissors },
      { href: "/admin/servicos", label: "Serviços", show: isAdminArea, Icon: Tag },
    ],
    [isAdminArea]
  );

  const itemsToRender = isAdminArea ? adminItems : navItems;

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  if (isAdminLogin) return null;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-black/10 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group inline-flex items-center gap-2">
              <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white shadow-sm">
                <span className="h-2 w-2 rounded-full bg-black" />
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
          <nav className="hidden items-center gap-2 lg:flex">
            {itemsToRender
              .filter((i) => i.show)
              .map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      active ? "bg-black text-white" : "text-black/70 hover:bg-black/5 hover:text-black"
                    )}
                  >
                    <item.Icon size={16} className={cx(active ? "text-white" : "text-black/60")} />
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isAdminArea && (
              <Link
                href="/admin/login"
                className="hidden items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-black/70 transition hover:border-black/30 hover:text-black lg:inline-flex"
              >
                <User size={16} className="text-black/60" />
                Admin
              </Link>
            )}

            {isAdminArea && (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href="/admin/perfil"
                  className={cx(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                    pathname.startsWith("/admin/perfil")
                      ? "border-black bg-black text-white"
                      : "border-black/10 text-black/70 hover:border-black/30"
                  )}
                >
                  <User size={16} className={cx(pathname.startsWith("/admin/perfil") ? "text-white" : "text-black/60")} />
                  Perfil
                </Link>
                <form action={logoutAdmin}>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-red-600 transition hover:border-red-600/40">
                    <LogOut size={16} />
                    Sair
                  </button>
                </form>
              </div>
            )}

            {/* Mobile Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-black/80 shadow-sm lg:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE DRAWER SYSTEM --- */}
      <div className="lg:hidden">
        {/* Overlay - Sempre no DOM, controlado por opacidade */}
        <div
          className={cx(
            "fixed inset-0 z-60 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel - Desliza da direita */}
        <aside
          className={cx(
            "fixed right-0 top-0 z-70 h-full w-70 bg-white shadow-2xl transition-transform duration-300 ease-in-out",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-black/5 px-4">
            <span className="text-sm font-bold uppercase tracking-wider text-black/40">
              {isAdminArea ? "Painel Admin" : "Menu"}
            </span>
            <button
              ref={closeBtnRef}
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 text-black"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-1 p-4">
            {itemsToRender
              .filter((i) => i.show)
              .map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cx(
                      "flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-all active:scale-[0.98]",
                      active ? "bg-black text-white shadow-lg shadow-black/10" : "text-black/70 hover:bg-black/5"
                    )}
                  >
                    <item.Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}

            {/* Divisor e Ações Extras */}
            <div className="my-4 h-px bg-black/5" />
            
            {!isAdminArea ? (
              <Link
                href="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-black/70 hover:bg-black/5"
              >
                <User size={20} />
                Área do Admin
              </Link>
            ) : (
              <>
                <Link
                  href="/admin/perfil"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-black/70 hover:bg-black/5"
                >
                  <User size={20} />
                  Meu Perfil
                </Link>
                <form action={logoutAdmin} className="w-full">
                  <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-red-600 hover:bg-red-50">
                    <LogOut size={20} />
                    Sair da Conta
                  </button>
                </form>
              </>
            )}
          </div>
        </aside>
      </div>

      <div className="pointer-events-none h-px w-full bg-linear-to-r from-transparent via-black/10 to-transparent" />
    </header>
  );
}