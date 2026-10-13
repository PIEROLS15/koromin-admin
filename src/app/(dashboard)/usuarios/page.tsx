import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/users/users-table";
import { getUserList } from "@/server/users/queries";

export default async function UsersPage() {
  const currentUser = await requirePermission("users.manage");
  const users = await getUserList();

  return (
    <>
      <PageHeader title="Usuarios" description="Administración de roles y estado de usuarios." />
      <Card>
        <CardHeader className="px-6 pb-4 pt-6">
          <CardTitle className="text-base font-semibold tracking-normal">Usuarios del sistema</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <UsersTable users={users} currentUserId={currentUser.id} />
        </CardContent>
      </Card>
    </>
  );
}
