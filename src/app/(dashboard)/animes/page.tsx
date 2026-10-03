import { ModulePage } from "@/components/layout/module-page";

export default function AnimesPage() {
  return (
    <ModulePage
      title="Animes / Categorías"
      description="Franquicias, categorías y tipos de producto configurables."
      tableTitle="Catálogos"
      tableDescription="ProductType se mantiene como tabla para evitar migraciones por nuevos tipos."
      columns={["Nombre", "Tipo", "Activo", "Productos relacionados"]}
      createLabel="Nuevo catálogo"
    />
  );
}
