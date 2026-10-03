import { ModulePage } from "@/components/layout/module-page";

export default function InventoryPage() {
  return (
    <ModulePage
      title="Inventario"
      description="Unidades físicas con costo real, estado y origen de compra."
      tableTitle="Unidades de inventario"
      tableDescription="Cada fila representa una unidad física de InventoryUnit."
      columns={["Producto", "Pedido", "Costo real", "Estado", "Creado"]}
    />
  );
}
