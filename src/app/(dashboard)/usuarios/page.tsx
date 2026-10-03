import { ModulePage } from "@/components/layout/module-page";

export default function UsersPage() {
  return (
    <ModulePage
      title="Usuarios"
      description="Administración de roles y estado de usuarios autenticados por Google."
      tableTitle="Usuarios del sistema"
      tableDescription="Los cambios de rol deben validarse con autorización de ADMIN en servidor."
      columns={["Nombre", "Correo", "Rol", "Estado", "Último login"]}
    />
  );
}
