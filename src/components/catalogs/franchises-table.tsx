"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createFranchise, deleteFranchise, updateFranchise } from "@/actions/catalogs/franchises";
import { PlatformDataTable, type PlatformTableColumn } from "@/components/data-table/platform-data-table";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { currency } from "@/lib/money/format";

type FranchiseRow = {
  id: string;
  name: string;
  active: boolean;
  products: number;
  stock: number;
  sold: number;
  revenue: number;
};

type DialogState = { mode: "create" } | { mode: "edit"; franchise: FranchiseRow } | null;

export function FranchisesManager({ rows }: { rows: FranchiseRow[] }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setName("");
    setActive(true);
    setDialog({ mode: "create" });
  };

  const openEdit = (franchise: FranchiseRow) => {
    setName(franchise.name);
    setActive(franchise.active);
    setDialog({ mode: "edit", franchise });
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Ingresa un nombre.");
      return;
    }
    setSaving(true);
    try {
      const result =
        dialog?.mode === "edit"
          ? await updateFranchise(dialog.franchise.id, { name: trimmed, active })
          : await createFranchise({ name: trimmed, active });
      if (result.ok) {
        toast.success(dialog?.mode === "edit" ? "Anime guardado" : "Anime creado");
        setDialog(null);
      } else {
        toast.error(result.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (row: FranchiseRow) => {
    const result = await updateFranchise(row.id, { name: row.name, active: !row.active });
    if (result.ok) toast.success(row.active ? "Desactivado" : "Activado");
    else toast.error(result.error);
  };

  const handleDelete = async (row: FranchiseRow) => {
    const result = await deleteFranchise(row.id);
    if (result.ok) toast.success("Anime eliminado");
    else toast.error(result.error);
  };

  const columns: PlatformTableColumn<FranchiseRow>[] = [
    {
      id: "name",
      header: "Anime / franquicia",
      label: "Anime",
      value: (row) => row.name,
      sortable: true,
      filter: "text",
      className: "font-medium",
      cell: (row) => row.name,
    },
    { id: "products", header: "Productos", value: (row) => row.products, sortable: true, filter: "number", align: "right", cell: (row) => row.products },
    { id: "stock", header: "En stock", value: (row) => row.stock, sortable: true, filter: "number", align: "right", cell: (row) => row.stock },
    { id: "sold", header: "Vendidos", value: (row) => row.sold, sortable: true, filter: "number", align: "right", cell: (row) => row.sold },
    { id: "revenue", header: "Ingresos", value: (row) => row.revenue, sortable: true, filter: "number", align: "right", cell: (row) => currency(row.revenue) },
    {
      id: "status",
      header: "Estado",
      value: (row) => (row.active ? "activo" : "inactivo"),
      sortable: true,
      filter: "enum",
      options: [
        { value: "activo", label: "Activo" },
        { value: "inactivo", label: "Inactivo" },
      ],
      cell: (row) => (
        <Badge className={row.active ? "border-transparent bg-primary-softer text-primary" : "border-transparent bg-secondary text-secondary-foreground"}>
          {row.active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "w-10",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" aria-label={`Acciones de ${row.name}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row)}>
              <Pencil className="size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggle(row)}>
              <Power className="size-4" />
              {row.active ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(row)}>
              <Trash2 className="size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Animes / Categorías"
        description="Franquicias que agrupan mangas, figuras y merch."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo anime
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <PlatformDataTable
            data={rows}
            columns={columns}
            rowKey={(row) => row.id}
            entity={{ singular: "anime", plural: "animes" }}
            searchPlaceholder="Buscar anime..."
            searchText={(row) => row.name}
            initialSort={{ id: "name", dir: "asc" }}
            emptyLabel="Sin animes registrados."
            minWidth="860px"
          />
        </CardContent>
      </Card>

      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "edit" ? "Editar anime" : "Nuevo anime"}</DialogTitle>
            <DialogDescription>Un anime puede tener muchos productos asociados.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSave()}
                placeholder="One Piece"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Activo</p>
                <p className="text-xs text-muted-foreground">Los inactivos no se sugieren al crear productos.</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} aria-label="Activo" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
