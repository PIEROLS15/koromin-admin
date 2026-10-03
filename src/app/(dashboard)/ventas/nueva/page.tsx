import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewSalePage() {
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
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
              <CardDescription>Toda venta debe estar relacionada con un cliente.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente <span className="text-destructive">*</span></Label>
                <Input id="customer" placeholder="Buscar o crear cliente" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saleDate">Fecha <span className="text-destructive">*</span></Label>
                <Input id="saleDate" type="date" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Productos con stock</CardTitle>
              <CardDescription>Buscador separado, resultados y área de seleccionados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <PackageSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Buscar por nombre, anime, volumen o tipo" />
              </div>
              <div className="grid h-40 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">
                Los resultados mostrarán solo productos con InventoryUnit en stock.
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>La confirmación validará stock y venderá unidades FIFO.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Subtotal: S/ 0.00</p>
            <p>Descuento: S/ 0.00</p>
            <p>Delivery: S/ 0.00</p>
            <p className="font-semibold text-foreground">Total: S/ 0.00</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
