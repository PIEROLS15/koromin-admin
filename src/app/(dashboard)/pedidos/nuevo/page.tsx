import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/guards";
import { getOrderFormOptions } from "@/server/orders/queries";
import { OrderForm } from "./order-form";

export default async function NewOrderPage() {
  await requirePermission("orders.manage");
  const { suppliers, products, investors } = await getOrderFormOptions();

  return (
    <>
      <PageHeader
        title="Nuevo pedido"
        description="Registra la compra al proveedor sin perder el estado del flujo."
        actions={
          <Button variant="outline" asChild>
            <Link href="/pedidos">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        }
      />
      <OrderForm suppliers={suppliers} products={products} investors={investors} />
    </>
  );
}
