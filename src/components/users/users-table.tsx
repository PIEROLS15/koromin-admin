import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/server/shared/format";

export function UsersTable({ users }: { users: Array<{ id: string; name: string | null; email: string; role: string; status: string; lastLoginAt: Date | null }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Último login</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name ?? "-"}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell><Badge>{user.role}</Badge></TableCell>
            <TableCell>{user.status}</TableCell>
            <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
