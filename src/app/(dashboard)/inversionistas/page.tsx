import { ModulePage } from "@/components/layout/module-page";

export default function InvestorsPage() {
  return (
    <ModulePage
      title="Inversionistas"
      description="Vista financiera de usuarios con aportes; no es un CRUD independiente."
      tableTitle="Usuarios inversionistas"
      tableDescription="Aparecen automáticamente cuando tienen al menos un OrderInvestment."
      columns={["Usuario", "Total invertido", "Capital recuperado", "Ganancia", "Pedidos"]}
      emptyLabel="Aún no hay usuarios con aportes registrados."
    />
  );
}
