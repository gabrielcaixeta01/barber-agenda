"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useMemo, useState } from "react";
import { logoutAdmin } from "@/app/admin/actions";
import {
  Calendar,
  Clock,
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
      { href: "/admin/horarios", label: "Horários", show: isAdminArea, Icon: Clock },
      { href: "/admin/servicos", label: "Serviços", show: isAdminArea, Icon: Tag },
    ],
    [isAdminArea]
  );

  const itemsToRender = isAdminArea
    ? adminItems.filter((i) => i.show)
    : navItems.filter((i) => i.show);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  if (isAdminLogin) return null;

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-black/10 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
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
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-black text-white"
                      : "text-black/70 hover:bg-black/5 hover:text-black"
                  )}
                >
                  <item.Icon
                    size={16}
                    className={cx(active ? "text-white" : "text-black/60")}
                  />
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
                className="hidden items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-black/70 transition hover:border-black/30 hover:text-black md:inline-flex"
              >
                <User size={16} className="text-black/60" />
                Admin
              </Link>
            )}

            {isAdminArea && (
              <div className="hidden items-center gap-2 md:flex">
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
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-red-600 transition hover:border-red-600/40"
                  >
                    <LogOut size={16} className="text-red-600" />
                    Sair
                  </button>
                </form>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-black/80 shadow-sm transition hover:border-black/25 hover:text-black md:hidden"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={cx("md:hidden", mobileOpen ? "block" : "hidden")}>
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
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition",
                        active
                          ? "bg-black text-white"
                          : "text-black/70 hover:bg-black/5 hover:text-black"
                      )}
                    >
                      <item.Icon
                        size={16}
                        className={cx(active ? "text-white" : "text-black/60")}
                      />
                      {item.label}
                    </Link>
                  );
                })}

                {!isAdminArea && (
                  <div className="mt-2 grid gap-2 border-t border-black/10 pt-2">
                    <Link
                      href="/agendar"
                      className="flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-center text-sm font-medium text-white transition hover:opacity-90"
                    >
                      <Calendar size={16} className="text-white" />
                      Agendar
                    </Link>
                    <Link
                      href="/admin/login"
                      className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-3 text-center text-sm text-black/70 transition hover:border-black/30 hover:text-black"
                    >
                      <User size={16} className="text-black/60" />
                      Admin
                    </Link>
                  </div>
                )}

                {isAdminArea && (
                  <div className="mt-2 grid gap-2 border-t border-black/10 pt-2">
                    <Link
                      href="/admin/perfil"
                      className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-3 text-center text-sm text-black/70 transition hover:border-black/30 hover:text-black"
                    >
                      <User size={16} className="text-black/60" />
                      Perfil
                    </Link>
                    <form action={logoutAdmin}>
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-3 py-3 text-center text-sm text-red-600 transition hover:bg-red-500/20"
                      >
                        <LogOut size={16} className="text-red-600" />
                        Sair
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none h-px w-full bg-linear-to-r from-transparent via-black/10 to-transparent" />
    </header>
  );
}