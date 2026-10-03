import { ModulePage } from "@/components/layout/module-page";

export default function FinancePage() {
  return (
    <ModulePage
      title="Finanzas"
      description="Gastos, inversión, recuperación de capital y ganancia."
      tableTitle="Movimientos financieros"
      tableDescription="La distribución de ganancias entre inversionistas aún requiere regla de negocio final."
      columns={["Fecha", "Tipo", "Descripción", "Monto", "Relacionado"]}
    />
  );
}
