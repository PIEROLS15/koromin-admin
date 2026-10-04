import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/users/users-table";
import { getUserList } from "@/server/users/queries";

export default async function UsersPage() {
  await requirePermission("users.manage");
  const users = await getUserList();

  return (
    <>
      <PageHeader title="Usuarios" description="Administración de roles y estado de usuarios autenticados por Google." />
      <Card>
        <CardHeader><CardTitle>Usuarios del sistema</CardTitle><CardDescription>Mostrando hasta 100 usuarios.</CardDescription></CardHeader>
        <CardContent><UsersTable users={users} /></CardContent>
      </Card>
    </>
  );
}
