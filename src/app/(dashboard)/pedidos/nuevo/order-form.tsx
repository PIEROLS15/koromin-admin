"use client";

import { useActionState, type ReactNode, type SelectHTMLAttributes } from "react";

import { createOrderFormAction } from "@/actions/orders/create-order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/actions/state";

interface Option {
  id: string;
  name: string;
}

export function OrderForm({ suppliers, products, investors }: { suppliers: Option[]; products: Option[]; investors: Option[] }) {
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
          <Field label="Proveedor" htmlFor="supplierId" required>
            <NativeSelect id="supplierId" name="supplierId" required options={suppliers} />
          </Field>
          <Field label="Fecha" htmlFor="orderDate" required>
            <Input id="orderDate" name="orderDate" type="date" required />
          </Field>
          <Field label="Llegada estimada" htmlFor="estimatedArrivalDate">
            <Input id="estimatedArrivalDate" name="estimatedArrivalDate" type="date" />
          </Field>
          <Field label="Observaciones" htmlFor="observations">
            <Input id="observations" name="observations" placeholder="Notas internas" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Producto</CardTitle>
          <CardDescription>Flujo mínimo conectado a Server Actions. Se puede ampliar a múltiples líneas.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ProductLine key={index} index={index} products={products} required={index === 0} />
          ))}
          <Field label="Delivery" htmlFor="deliveryCost">
            <Input id="deliveryCost" name="deliveryCost" inputMode="decimal" placeholder="0.00" />
          </Field>
          <Field label="Otros costos" htmlFor="otherCosts">
            <Input id="otherCosts" name="otherCosts" inputMode="decimal" placeholder="0.00" />
          </Field>
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
          {Array.from({ length: 2 }).map((_, index) => (
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

function ProductLine({ index, products, required }: { index: number; products: Option[]; required?: boolean }) {
  return (
    <div className="grid gap-4 rounded-lg border bg-muted/20 p-3 sm:col-span-3 sm:grid-cols-3">
      <Field label={`Producto ${index + 1}`} htmlFor={`items.${index}.productId`} required={required}>
        <NativeSelect id={`items.${index}.productId`} name={`items.${index}.productId`} required={required} options={products} />
      </Field>
      <Field label="Cantidad" htmlFor={`items.${index}.quantity`} required={required}>
        <Input id={`items.${index}.quantity`} name={`items.${index}.quantity`} type="number" min="1" step="1" required={required} />
      </Field>
      <Field label="Costo unitario" htmlFor={`items.${index}.unitPurchaseCost`} required={required}>
        <Input id={`items.${index}.unitPurchaseCost`} name={`items.${index}.unitPurchaseCost`} inputMode="decimal" placeholder="0.00" required={required} />
      </Field>
    </div>
  );
}

function InvestmentLine({ index, investors }: { index: number; investors: Option[] }) {
  return (
    <div className="grid gap-4 rounded-lg border bg-muted/20 p-3 sm:col-span-2 sm:grid-cols-3">
      <Field label={`Inversionista ${index + 1}`} htmlFor={`investments.${index}.userId`}>
        <NativeSelect id={`investments.${index}.userId`} name={`investments.${index}.userId`} options={investors} />
      </Field>
      <Field label="Monto" htmlFor={`investments.${index}.amount`}>
        <Input id={`investments.${index}.amount`} name={`investments.${index}.amount`} inputMode="decimal" placeholder="0.00" />
      </Field>
      <Field label="Fecha" htmlFor={`investments.${index}.contributionDate`}>
        <Input id={`investments.${index}.contributionDate`} name={`investments.${index}.contributionDate`} type="date" />
      </Field>
    </div>
  );
}

function Field({ label, htmlFor, required, children }: { label: string; htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label} {required && <span className="text-destructive">*</span>}</Label>
      {children}
    </div>
  );
}

function NativeSelect({ options, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { options: Option[] }) {
  return (
    <select
      className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      <option value="">Selecciona una opción</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>{option.name}</option>
      ))}
    </select>
  );
}
