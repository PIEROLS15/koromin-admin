"use client";

import { useActionState, type ReactNode, type SelectHTMLAttributes } from "react";

import { createSaleFormAction } from "@/actions/sales/create-sale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/actions/state";

interface Option {
  id: string;
  name: string;
}

export function SaleForm({ customers, products }: { customers: Option[]; products: Option[] }) {
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
          <Field label="Cliente" htmlFor="customerId" required>
            <NativeSelect id="customerId" name="customerId" required options={customers} />
          </Field>
          <Field label="Fecha" htmlFor="saleDate" required>
            <Input id="saleDate" name="saleDate" type="date" required />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Producto con stock</CardTitle>
          <CardDescription>Flujo mínimo conectado a Server Actions con asignación FIFO.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SaleLine key={index} index={index} products={products} required={index === 0} />
          ))}
          <Field label="Descuento" htmlFor="discount">
            <Input id="discount" name="discount" inputMode="decimal" placeholder="0.00" />
          </Field>
          <Field label="Delivery" htmlFor="deliveryCharge">
            <Input id="deliveryCharge" name="deliveryCharge" inputMode="decimal" placeholder="0.00" />
          </Field>
          <Field label="Otros cargos" htmlFor="otherCharges">
            <Input id="otherCharges" name="otherCharges" inputMode="decimal" placeholder="0.00" />
          </Field>
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

function SaleLine({ index, products, required }: { index: number; products: Option[]; required?: boolean }) {
  return (
    <div className="grid gap-4 rounded-lg border bg-muted/20 p-3 sm:col-span-3 sm:grid-cols-3">
      <Field label={`Producto ${index + 1}`} htmlFor={`lines.${index}.productId`} required={required}>
        <NativeSelect id={`lines.${index}.productId`} name={`lines.${index}.productId`} required={required} options={products} />
      </Field>
      <Field label="Cantidad" htmlFor={`lines.${index}.quantity`} required={required}>
        <Input id={`lines.${index}.quantity`} name={`lines.${index}.quantity`} type="number" min="1" step="1" required={required} />
      </Field>
      <Field label="Precio unitario" htmlFor={`lines.${index}.unitPrice`} required={required}>
        <Input id={`lines.${index}.unitPrice`} name={`lines.${index}.unitPrice`} inputMode="decimal" placeholder="0.00" required={required} />
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
