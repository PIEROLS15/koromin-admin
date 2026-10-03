import { Bell } from "lucide-react";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { requireActiveUser } from "@/lib/auth/guards";

export async function AppShell({ children }: { children: ReactNode }) {
  const user = await requireActiveUser();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur">
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold text-foreground">
              KoroMin Anime Merch
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Sistema administrativo de pedidos, inventario y finanzas
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Pedidos por recibir">
              <Bell className="h-4 w-4" />
            </Button>
            <UserMenu user={user} />
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
