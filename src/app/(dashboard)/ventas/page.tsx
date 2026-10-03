import { ModulePage } from "@/components/layout/module-page";

export default function SalesPage() {
  return (
    <ModulePage
      title="Ventas"
      description="Ventas con cliente obligatorio, unidades FIFO y ganancia por costo real."
      tableTitle="Listado de ventas"
      tableDescription="Cada venta relaciona SaleItem con las unidades físicas vendidas."
      columns={["Código", "Cliente", "Fecha", "Total", "Ganancia"]}
      createHref="/ventas/nueva"
      createLabel="Nueva venta"
    />
  );
}
