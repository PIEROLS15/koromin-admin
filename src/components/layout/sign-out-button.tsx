"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";

export function SignOutButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/login" })}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        compact && "w-auto justify-center border px-3",
        className,
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {!compact && <span>Cerrar sesión</span>}
    </button>
  );
}
