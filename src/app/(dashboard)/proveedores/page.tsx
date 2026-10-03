import { ModulePage } from "@/components/layout/module-page";

export default function SuppliersPage() {
  return (
    <ModulePage
      title="Proveedores"
      description="Proveedores asociados a pedidos de compra."
      tableTitle="Proveedores"
      tableDescription="También se podrán crear rápidamente desde el flujo de pedido."
      columns={["Nombre", "Contacto", "Página", "Pedidos"]}
      createLabel="Nuevo proveedor"
    />
  );
}
