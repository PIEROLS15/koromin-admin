import Image from "next/image";
import { UserRound } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireActiveUser } from "@/lib/auth/guards";
import { formatDate } from "@/server/shared/format";
import { getUserProfile } from "@/server/users/queries";

const roleLabel = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  VISITOR: "Visitante",
};

const statusLabel = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

export default async function ProfilePage() {
  const activeUser = await requireActiveUser();

  const user = await getUserProfile(activeUser.id);

  const fullName = user.name || "Sin nombre";
  const initials = (user.name || user.email)
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <>
      <PageHeader
        title="Mi perfil"
        description="Tus datos personales. Inicias sesión con tu cuenta de Google."
      />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={112}
                  height={112}
                  className="size-28 rounded-full border-4 border-primary-softer object-cover"
                />
              ) : (
                <div className="grid size-28 place-items-center rounded-full border-4 border-primary-softer bg-primary text-3xl font-semibold text-primary-foreground">
                  {initials || <UserRound className="h-10 w-10" />}
                </div>
              )}
            </div>
            <h2 className="text-lg font-semibold">{fullName}</h2>
            <p className="mt-1 max-w-full truncate text-sm text-muted-foreground">{user.email}</p>
            <Badge className="mt-4 bg-primary-softer text-primary">{roleLabel[user.role]}</Badge>
            <p className="mt-5 text-xs text-muted-foreground">
              Cuenta creada el {formatDate(user.createdAt)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos personales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <ReadonlyField label="Nombre" value={user.name ?? ""} />
            <ReadonlyField label="Correo electrónico" value={user.email} />
            <ReadonlyField label="Rol" value={roleLabel[user.role]} />
            <ReadonlyField label="Estado" value={statusLabel[user.status]} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} readOnly disabled className="disabled:cursor-default disabled:opacity-100" />
    </div>
  );
}
