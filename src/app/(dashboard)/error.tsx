"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No se pudo cargar esta sección</CardTitle>
        <CardDescription>Intenta nuevamente. Si el problema continúa, revisa la conexión con la base de datos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" onClick={reset}>Reintentar</Button>
      </CardContent>
    </Card>
  );
}
