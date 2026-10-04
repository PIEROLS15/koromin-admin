import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth/options";
import { GoogleSignInButton } from "./sign-in-button";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id && session.user.status === "ACTIVE") redirect("/");

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(420px,1fr)_minmax(460px,1fr)]">
      <section className="relative hidden overflow-hidden bg-[linear-gradient(160deg,var(--color-primary)_0%,var(--color-primary-soft)_66%,oklch(0.76_0.11_337)_100%)] p-8 text-primary-foreground lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-gold text-base font-bold text-gold-foreground">
            K
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold">KoroMin</p>
            <p className="text-sm text-primary-foreground/85">Anime Merch</p>
          </div>
        </div>

        <div className="mt-auto max-w-xl pb-28">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Tu tienda de anime, bajo control.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-primary-foreground/90">
            Pedidos, inventario por unidad, ventas e inversionistas en un solo lugar.
          </p>
        </div>

        <p className="text-sm text-primary-foreground/80">Acceso exclusivo para el equipo de KoroMin.</p>
      </section>

      <section className="grid min-h-screen place-items-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresa con tu cuenta de Google para acceder al sistema administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleSignInButton />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
