"use client";

import { useActionState } from "react";

import { createSaleFormAction } from "@/actions/sales/create-sale";
import { FormField } from "@/components/forms/form-field";
import { NativeSelect, type SelectOption } from "@/components/forms/native-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/actions/state";
import { SALE_FORM_MAX_LINES } from "@/lib/forms/limits";

export function SaleForm({ customers, products }: { customers: SelectOption[]; products: SelectOption[] }) {
  const [state, action, pending] = useActionState(createSaleFormAction, initialActionState);
  const disabled = customers.length === 0 || products.length === 0 || pending;

  return (
    <form action={action} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
          <CardDescription>Toda venta debe estar relacionada con un cliente.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Cliente" htmlFor="customerId" required>
            <NativeSelect id="customerId" name="customerId" required options={customers} />
          </FormField>
          <FormField label="Fecha" htmlFor="saleDate" required>
            <Input id="saleDate" name="saleDate" type="date" required />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Producto con stock</CardTitle>
          <CardDescription>Selecciona productos disponibles; el sistema asigna las unidades más antiguas primero.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: SALE_FORM_MAX_LINES }).map((_, index) => (
            <SaleLine key={index} index={index} products={products} required={index === 0} />
          ))}
          <FormField label="Descuento" htmlFor="discount">
            <Input id="discount" name="discount" inputMode="decimal" placeholder="0.00" />
          </FormField>
          <FormField label="Delivery" htmlFor="deliveryCharge">
            <Input id="deliveryCharge" name="deliveryCharge" inputMode="decimal" placeholder="0.00" />
          </FormField>
          <FormField label="Otros cargos" htmlFor="otherCharges">
            <Input id="otherCharges" name="otherCharges" inputMode="decimal" placeholder="0.00" />
          </FormField>
          <div className="flex items-end sm:col-span-3">
            <Button type="submit" disabled={disabled} className="w-full sm:w-auto">
              {pending ? "Guardando..." : "Crear venta"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {state.message && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </p>
      )}
      {disabled && !pending && (
        <p className="text-sm text-muted-foreground">Necesitas al menos un cliente y un producto con stock.</p>
      )}
    </form>
  );
}

function SaleLine({ index, products, required }: { index: number; products: SelectOption[]; required?: boolean }) {
  return (
    <div className="grid gap-4 rounded-lg border bg-muted/20 p-3 sm:col-span-3 sm:grid-cols-3">
      <FormField label={`Producto ${index + 1}`} htmlFor={`lines.${index}.productId`} required={required}>
        <NativeSelect id={`lines.${index}.productId`} name={`lines.${index}.productId`} required={required} options={products} />
      </FormField>
      <FormField label="Cantidad" htmlFor={`lines.${index}.quantity`} required={required}>
        <Input id={`lines.${index}.quantity`} name={`lines.${index}.quantity`} type="number" min="1" step="1" required={required} />
      </FormField>
      <FormField label="Precio unitario" htmlFor={`lines.${index}.unitPrice`} required={required}>
        <Input id={`lines.${index}.unitPrice`} name={`lines.${index}.unitPrice`} inputMode="decimal" placeholder="0.00" required={required} />
      </FormField>
    </div>
  );
}
