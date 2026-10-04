import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/guards";
import { getSaleFormOptions } from "@/server/sales/queries";
import { SaleForm } from "./sale-form";

export default async function NewSalePage() {
  await requirePermission("sales.manage");
  const { customers, products } = await getSaleFormOptions();

  return (
    <>
      <PageHeader
        title="Nueva venta"
        description="Busca productos con stock, elige cliente y confirma asignación FIFO."
        actions={
          <Button variant="outline" asChild>
            <Link href="/ventas">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        }
      />
      <SaleForm customers={customers} products={products} />
    </>
  );
}
