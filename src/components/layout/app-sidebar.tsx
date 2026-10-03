"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Contact,
  LayoutDashboard,
  PackageSearch,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { cn } from "@/lib/utils";

const operacion = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Pedidos", url: "/pedidos", icon: ShoppingCart },
  { title: "Productos", url: "/productos", icon: PackageSearch },
  { title: "Inventario", url: "/inventario", icon: Boxes },
  { title: "Ventas", url: "/ventas", icon: Receipt },
  { title: "Clientes", url: "/clientes", icon: Contact },
] as const;

const gestion = [
  { title: "Animes / Categorías", url: "/animes", icon: Sparkles },
  { title: "Proveedores", url: "/proveedores", icon: Truck },
  { title: "Inversionistas", url: "/inversionistas", icon: Users },
  { title: "Usuarios", url: "/usuarios", icon: ShieldCheck },
  { title: "Finanzas", url: "/finanzas", icon: Wallet },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  const renderItems = (items: readonly (typeof operacion[number] | typeof gestion[number])[]) =>
    items.map((item) => (
      <Link
        key={item.url}
        href={item.url}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground",
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.title}</span>
      </Link>
    ));

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground md:flex md:flex-col">
      <Link href="/" className="mb-4 flex items-center gap-2.5 rounded-lg px-1 py-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
          K
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-display text-sm font-semibold">KoroMin</span>
          <span className="text-[11px] text-sidebar-foreground/70">Anime Merch</span>
        </span>
      </Link>
      <div className="space-y-5 overflow-y-auto">
        <nav className="space-y-1">
          <p className="px-3 pb-1 text-xs font-medium text-sidebar-foreground/70">Operación</p>
          {renderItems(operacion)}
        </nav>
        <nav className="space-y-1">
          <p className="px-3 pb-1 text-xs font-medium text-sidebar-foreground/70">Gestión</p>
          {renderItems(gestion)}
        </nav>
      </div>
      <div className="mt-auto space-y-1 border-t border-sidebar-border pt-3">
        <SignOutButton />
      </div>
    </aside>
  );
}
