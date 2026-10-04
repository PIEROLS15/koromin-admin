"use client";

import { useActionState } from "react";

import { createOrderFormAction } from "@/actions/orders/create-order";
import { FormField } from "@/components/forms/form-field";
import { NativeSelect, type SelectOption } from "@/components/forms/native-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/actions/state";
import { ORDER_FORM_MAX_INVESTMENTS, ORDER_FORM_MAX_ITEMS } from "@/lib/forms/limits";

export function OrderForm({ suppliers, products, investors }: { suppliers: SelectOption[]; products: SelectOption[]; investors: SelectOption[] }) {
  const [state, action, pending] = useActionState(createOrderFormAction, initialActionState);
  const disabled = suppliers.length === 0 || products.length === 0 || pending;

  return (
    <form action={action} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Datos generales</CardTitle>
          <CardDescription>Registra un pedido con una primera línea de producto.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Proveedor" htmlFor="supplierId" required>
            <NativeSelect id="supplierId" name="supplierId" required options={suppliers} />
          </FormField>
          <FormField label="Fecha" htmlFor="orderDate" required>
            <Input id="orderDate" name="orderDate" type="date" required />
          </FormField>
          <FormField label="Llegada estimada" htmlFor="estimatedArrivalDate">
            <Input id="estimatedArrivalDate" name="estimatedArrivalDate" type="date" />
          </FormField>
          <FormField label="Observaciones" htmlFor="observations">
            <Input id="observations" name="observations" placeholder="Notas internas" />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Producto</CardTitle>
          <CardDescription>Agrega hasta tres productos en el mismo pedido.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: ORDER_FORM_MAX_ITEMS }).map((_, index) => (
            <ProductLine key={index} index={index} products={products} required={index === 0} />
          ))}
          <FormField label="Delivery" htmlFor="deliveryCost">
            <Input id="deliveryCost" name="deliveryCost" inputMode="decimal" placeholder="0.00" />
          </FormField>
          <FormField label="Otros costos" htmlFor="otherCosts">
            <Input id="otherCosts" name="otherCosts" inputMode="decimal" placeholder="0.00" />
          </FormField>
          <div className="flex items-end">
            <Button type="submit" disabled={disabled} className="w-full">
              {pending ? "Guardando..." : "Crear pedido"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inversión</CardTitle>
          <CardDescription>Aportes opcionales asociados al pedido.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: ORDER_FORM_MAX_INVESTMENTS }).map((_, index) => (
            <InvestmentLine key={index} index={index} investors={investors} />
          ))}
        </CardContent>
      </Card>

      {state.message && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </p>
      )}
      {disabled && !pending && (
        <p className="text-sm text-muted-foreground">Necesitas al menos un proveedor y un producto activos.</p>
      )}
    </form>
  );
}

function ProductLine({ index, products, required }: { index: number; products: SelectOption[]; required?: boolean }) {
  return (
    <div className="grid gap-4 rounded-lg border bg-muted/20 p-3 sm:col-span-3 sm:grid-cols-3">
      <FormField label={`Producto ${index + 1}`} htmlFor={`items.${index}.productId`} required={required}>
        <NativeSelect id={`items.${index}.productId`} name={`items.${index}.productId`} required={required} options={products} />
      </FormField>
      <FormField label="Cantidad" htmlFor={`items.${index}.quantity`} required={required}>
        <Input id={`items.${index}.quantity`} name={`items.${index}.quantity`} type="number" min="1" step="1" required={required} />
      </FormField>
      <FormField label="Costo unitario" htmlFor={`items.${index}.unitPurchaseCost`} required={required}>
        <Input id={`items.${index}.unitPurchaseCost`} name={`items.${index}.unitPurchaseCost`} inputMode="decimal" placeholder="0.00" required={required} />
      </FormField>
    </div>
  );
}

function InvestmentLine({ index, investors }: { index: number; investors: SelectOption[] }) {
  return (
    <div className="grid gap-4 rounded-lg border bg-muted/20 p-3 sm:col-span-2 sm:grid-cols-3">
      <FormField label={`Inversionista ${index + 1}`} htmlFor={`investments.${index}.userId`}>
        <NativeSelect id={`investments.${index}.userId`} name={`investments.${index}.userId`} options={investors} />
      </FormField>
      <FormField label="Monto" htmlFor={`investments.${index}.amount`}>
        <Input id={`investments.${index}.amount`} name={`investments.${index}.amount`} inputMode="decimal" placeholder="0.00" />
      </FormField>
      <FormField label="Fecha" htmlFor={`investments.${index}.contributionDate`}>
        <Input id={`investments.${index}.contributionDate`} name={`investments.${index}.contributionDate`} type="date" />
      </FormField>
    </div>
  );
}
