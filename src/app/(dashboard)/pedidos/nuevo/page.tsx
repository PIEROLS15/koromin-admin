import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const steps = ["Datos generales", "Productos", "Delivery y gastos", "Inversión", "Resumen"];

export default function NewOrderPage() {
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
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <Button key={step} variant={index === 0 ? "default" : "outline"} size="sm" className="rounded-full">
                {index === 0 ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs font-semibold">{index + 1}</span>}
                {step}
              </Button>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Datos generales</CardTitle>
              <CardDescription>Proveedor, fechas y observaciones del pedido.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor <span className="text-destructive">*</span></Label>
                <Input id="supplier" placeholder="Buscar o crear proveedor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderDate">Fecha <span className="text-destructive">*</span></Label>
                <Input id="orderDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eta">Llegada estimada</Label>
                <Input id="eta" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observaciones</Label>
                <Input id="notes" placeholder="Notas internas" />
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Los totales se calcularán desde el draft y se persistirán con Server Actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Productos: S/ 0.00</p>
            <p>Delivery: S/ 0.00</p>
            <p>Otros costos: S/ 0.00</p>
            <p className="font-semibold text-foreground">Total: S/ 0.00</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
