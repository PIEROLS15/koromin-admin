import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  return (
    <>
      <PageHeader
        title="Detalle de pedido"
        description={`Pedido ${orderId}. Al recibirlo se crearán InventoryUnit con costo real.`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/pedidos">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Recepción e inventario</CardTitle>
          <CardDescription>Esta operación debe ejecutarse con transacción Prisma.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Pendiente de conectar al pedido real desde PostgreSQL.
        </CardContent>
      </Card>
    </>
  );
}
