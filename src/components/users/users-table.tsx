"use client";

import Image from "next/image";

import { PlatformDataTable, type PlatformTableColumn } from "@/components/data-table/platform-data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  VISITOR: "Visitante",
};

const formatDate = (date: Date | null | undefined) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short" }).format(new Date(date));
};

const initials = (user: UserRow) => {
  const source = user.name?.trim() || user.email;
  const parts = source.split(/\s+|@/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";
};

const displayName = (user: UserRow) => user.name?.trim() || user.email;

export function UsersTable({ users, currentUserId }: { users: UserRow[]; currentUserId?: string }) {
  const columns: PlatformTableColumn<UserRow>[] = [
    {
      id: "name",
      header: "Usuario",
      value: displayName,
      sortable: true,
      filter: "text",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium">
            {user.image ? <Image src={user.image} alt="" fill sizes="32px" className="object-cover" /> : initials(user)}
          </div>
          <span className="font-medium">
            {displayName(user)}
            {user.id === currentUserId && <span className="ml-1 text-xs text-muted-foreground">(tú)</span>}
          </span>
        </div>
      ),
    },
    {
      id: "email",
      header: "Correo",
      value: (user) => user.email,
      sortable: true,
      filter: "text",
      className: "text-muted-foreground",
      cell: (user) => user.email,
    },
    {
      id: "role",
      header: "Rol",
      value: (user) => user.role,
      sortable: true,
      filter: "enum",
      options: Object.entries(roleLabel).map(([value, label]) => ({ value, label })),
      cell: (user) => <Badge className="border-transparent bg-primary-softer text-primary">{roleLabel[user.role] ?? user.role}</Badge>,
    },
    {
      id: "createdAt",
      header: "Registro",
      value: (user) => user.createdAt,
      sortable: true,
      filter: "date",
      cell: (user) => formatDate(user.createdAt),
    },
    {
      id: "lastLoginAt",
      header: "Último acceso",
      value: (user) => user.lastLoginAt,
      sortable: true,
      filter: "date",
      className: "text-muted-foreground",
      cell: (user) => formatDate(user.lastLoginAt),
    },
    {
      id: "updatedAt",
      header: "Última modificación",
      value: (user) => user.updatedAt,
      sortable: true,
      filter: "date",
      className: "text-muted-foreground",
      cell: (user) => formatDate(user.updatedAt),
    },
    {
      id: "status",
      header: "Estado",
      value: (user) => user.status,
      filter: "enum",
      options: [
        { value: "ACTIVE", label: "Activo" },
        { value: "INACTIVE", label: "Inactivo" },
      ],
      cell: (user) => (
        <Badge className={cn("border-transparent", user.status === "ACTIVE" ? "bg-green-50 text-success" : "bg-muted text-muted-foreground")}>
          {user.status === "ACTIVE" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ];

  return (
    <PlatformDataTable
      data={users}
      columns={columns}
      rowKey={(user) => user.id}
      entity={{ singular: "usuario", plural: "usuarios" }}
      searchPlaceholder="Buscar por nombre o correo..."
      searchText={(user) => `${displayName(user)} ${user.email}`}
      initialSort={{ id: "name", dir: "asc" }}
      minWidth="1160px"
      emptyLabel="No se encontraron usuarios."
    />
  );
}
