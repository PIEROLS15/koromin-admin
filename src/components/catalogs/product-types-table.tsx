"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createProductType, deleteProductType, updateProductType } from "@/actions/catalogs/product-types";
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

type ProductTypeItem = { id: string; name: string; slug: string; active: boolean; products: number };

type DialogState = { mode: "create" } | { mode: "edit"; productType: ProductTypeItem } | null;

export function ProductTypesManager({ rows }: { rows: ProductTypeItem[] }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProductTypeItem | null>(null);
  const [blocked, setBlocked] = useState<ProductTypeItem | null>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setName("");
    setActive(true);
    setDialog({ mode: "create" });
  };

  const openEdit = (productType: ProductTypeItem) => {
    setName(productType.name);
    setActive(productType.active);
    setDialog({ mode: "edit", productType });
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
          ? await updateProductType(dialog.productType.id, { name: trimmed, active })
          : await createProductType({ name: trimmed, active });
      if (result.ok) {
        toast.success(dialog?.mode === "edit" ? "Tipo guardado" : "Tipo creado");
        setDialog(null);
      } else {
        toast.error(result.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (row: ProductTypeItem) => {
    const result = await updateProductType(row.id, { name: row.name, active: !row.active });
    if (result.ok) toast.success(row.active ? "Desactivado" : "Activado");
    else toast.error(result.error);
  };

  const handleDelete = async (row: ProductTypeItem) => {
    const result = await deleteProductType(row.id);
    if (result.ok) {
      toast.success("Tipo eliminado");
      setConfirmDelete(null);
    } else {
      toast.error(result.error);
    }
  };

  const columns: PlatformTableColumn<ProductTypeItem>[] = [
    {
      id: "name",
      header: "Tipo",
      value: (row) => row.name,
      sortable: true,
      filter: "text",
      className: "font-medium",
      cell: (row) => row.name,
    },
    { id: "slug", header: "Slug", value: (row) => row.slug, sortable: true, filter: "text", className: "text-muted-foreground", cell: (row) => row.slug },
    { id: "products", header: "Productos", value: (row) => row.products, sortable: true, filter: "number", align: "right", cell: (row) => row.products },
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
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => (row.products > 0 ? setBlocked(row) : setConfirmDelete(row))}
            >
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
        title="Tipos de producto"
        description="Categorías de catálogo seleccionables al crear productos."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo tipo
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <PlatformDataTable
            data={rows}
            columns={columns}
            rowKey={(row) => row.id}
            entity={{ singular: "tipo", plural: "tipos" }}
            searchPlaceholder="Buscar tipo..."
            searchText={(row) => `${row.name} ${row.slug}`}
            initialSort={{ id: "name", dir: "asc" }}
            emptyLabel="Sin tipos de producto registrados."
            minWidth="760px"
          />
        </CardContent>
      </Card>

      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "edit" ? "Editar tipo" : "Nuevo tipo de producto"}</DialogTitle>
            <DialogDescription>El slug se genera automáticamente desde el nombre.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSave()}
                placeholder="Figura"
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

      <Dialog open={!!blocked} onOpenChange={(open) => !open && setBlocked(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No se puede eliminar</DialogTitle>
            <DialogDescription>«{blocked?.name}» tiene productos asociados; desactívalo en su lugar.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {blocked ? (
              <>
                <Button variant="outline" onClick={() => setBlocked(null)}>
                  Entendido
                </Button>
                <Button
                  onClick={async () => {
                    await handleToggle(blocked);
                    setBlocked(null);
                  }}
                >
                  <Power className="size-4" />
                  Desactivar
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setBlocked(null)}>
                Entendido
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este tipo?</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar «{confirmDelete?.name}»? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => confirmDelete && handleDelete(confirmDelete)}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
