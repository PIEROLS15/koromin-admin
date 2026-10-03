"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface HeaderUser {
  email: string;
  name: string | null;
  image: string | null;
}

function initials(user: HeaderUser) {
  const source = user.name || user.email;
  return source
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export function UserMenu({ user }: { user: HeaderUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="grid size-9 place-items-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-2 ring-primary/10 transition hover:ring-primary/30"
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        {user.image ? (
          <Image src={user.image} alt="" width={36} height={36} className="size-9 object-cover" />
        ) : (
          initials(user)
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-pop">
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-medium">{user.name || "Sin nombre"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <MenuItem href="/perfil" onClick={() => setOpen(false)}>
            <UserRound className="h-4 w-4" />
            Mi perfil
          </MenuItem>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/login" })}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({ href, onClick, children }: { href: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </Link>
  );
}
