import { ReactNode } from "react";
import { logoutAdmin } from "@/app/admin/action";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4">
        <span className="font-medium">Admin</span>

        <form action={logoutAdmin}>
          <button className="text-sm opacity-70 hover:opacity-100">
            Sair
          </button>
        </form>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}