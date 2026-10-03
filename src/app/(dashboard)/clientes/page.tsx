import { ModulePage } from "@/components/layout/module-page";

export default function CustomersPage() {
  return (
    <ModulePage
      title="Clientes"
      description="Clientes requeridos para registrar cualquier venta."
      tableTitle="Clientes"
      tableDescription="También se podrán crear rápidamente desde el flujo de venta."
      columns={["Nombre", "Contacto", "Ventas", "Creado"]}
      createLabel="Nuevo cliente"
    />
  );
}
