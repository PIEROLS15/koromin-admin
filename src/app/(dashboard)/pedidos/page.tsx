import { ModulePage } from "@/components/layout/module-page";

export default function OrdersPage() {
  return (
    <ModulePage
      title="Pedidos"
      description="Compras a proveedores, costos, aportes y recepción de inventario."
      tableTitle="Listado de pedidos"
      tableDescription="Preparado para ordenar por código, proveedor, estado y fecha."
      columns={["Código", "Proveedor", "Estado", "Fecha", "Total"]}
      createHref="/pedidos/nuevo"
      createLabel="Nuevo pedido"
    />
  );
}
