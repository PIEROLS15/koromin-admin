import { ModulePage } from "@/components/layout/module-page";

export default function ProductsPage() {
  return (
    <ModulePage
      title="Productos"
      description="Catálogo maestro. El costo y stock viven en pedidos e inventario."
      tableTitle="Catálogo"
      tableDescription="Productos con tipo, franquicia, categoría y detalle manga cuando aplica."
      columns={["Producto", "Tipo", "Anime / Franquicia", "Categoría", "Precio"]}
      createLabel="Nuevo producto"
    />
  );
}
