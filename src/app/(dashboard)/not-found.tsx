import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardNotFound() {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Recurso no encontrado</CardTitle>
        <CardDescription>No existe o no tienes permisos para verlo.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild><Link href="/">Volver al dashboard</Link></Button>
      </CardContent>
    </Card>
  );
}
