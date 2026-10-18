"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createProduct } from "@/actions/catalogs/create-catalogs";
import { deleteProduct, updateProduct } from "@/actions/catalogs/products";
import { PlatformDataTable, type PlatformTableColumn, type PlatformTableManualPagination } from "@/components/data-table/platform-data-table";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { currency } from "@/lib/money/format";
import type { ProductOptions } from "@/server/catalogs/queries";

const NONE = "none";

type ProductRow = {
  id: string;
  name: string;
  subtitle: string | null;
  franchiseId: string;
  franchise: string;
  productTypeId: string;
  productType: string;
  categoryId: string | null;
  manufacturer: string | null;
  salePrice: number;
  imageUrl: string | null;
  description: string | null;
  observations: string | null;
  stock: number;
  sold: number;
  hasRelations: boolean;
};

type DialogState = { mode: "create" } | { mode: "edit"; product: ProductRow } | null;

type OptionItem = { value: string; label: string };

export function ProductsManager({
  products,
  options,
  pagination,
}: {
  products: ProductRow[];
  options: ProductOptions;
  pagination: PlatformTableManualPagination;
}) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProductRow | null>(null);
  const [blocked, setBlocked] = useState<ProductRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [productTypeId, setProductTypeId] = useState("");
  const [franchiseId, setFranchiseId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [observations, setObservations] = useState("");

  const firstActive = (rows: Array<{ id: string; active: boolean }>) => rows.find((row) => row.active)?.id ?? rows[0]?.id ?? "";

  const openCreate = () => {
    setName("");
    setProductTypeId(firstActive(options.productTypes));
    setFranchiseId(firstActive(options.franchises));
    setCategoryId("");
    setManufacturer("");
    setSalePrice("");
    setImageUrl("");
    setDescription("");
    setObservations("");
    setDialog({ mode: "create" });
  };

  const openEdit = (product: ProductRow) => {
    setName(product.name);
    setProductTypeId(product.productTypeId);
    setFranchiseId(product.franchiseId);
    setCategoryId(product.categoryId ?? "");
    setManufacturer(product.manufacturer ?? "");
    setSalePrice(String(product.salePrice));
    setImageUrl(product.imageUrl ?? "");
    setDescription(product.description ?? "");
    setObservations(product.observations ?? "");
    setDialog({ mode: "edit", product });
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const price = Number(salePrice);
    if (!trimmedName) return toast.error("Ingresa un nombre.");
    if (!productTypeId || !franchiseId) return toast.error("Selecciona el tipo y el anime.");
    if (!(price > 0)) return toast.error("Indica un precio de venta válido.");

    setSaving(true);
    try {
      if (dialog?.mode === "edit") {
        const result = await updateProduct(dialog.product.id, {
          name: trimmedName,
          productTypeId,
          franchiseId,
          categoryId: categoryId || null,
          manufacturer: manufacturer.trim() || null,
          salePrice: price,
          imageUrl: imageUrl.trim() || null,
          description: description.trim() || null,
          observations: observations.trim() || null,
        });
        if (result.ok) {
          toast.success("Producto guardado");
          setDialog(null);
        } else {
          toast.error(result.error);
        }
      } else {
        await createProduct({
          name: trimmedName,
          productTypeId,
          franchiseId,
          categoryId: categoryId || undefined,
          manufacturer: manufacturer.trim() || undefined,
          salePrice: price,
          imageUrl: imageUrl.trim() || undefined,
          description: description.trim() || undefined,
          observations: observations.trim() || undefined,
        });
        toast.success("Producto creado");
        setDialog(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: ProductRow) => {
    const result = await deleteProduct(row.id);
    if (result.ok) {
      toast.success("Producto eliminado");
      setConfirmDelete(null);
    } else {
      toast.error(result.error);
    }
  };

  const typeOptions = options.productTypes.map((t) => ({ value: t.id, label: t.name }));
  const franchiseOptions = options.franchises.map((f) => ({ value: f.id, label: f.name }));

  const typeSelectOptions = options.productTypes
    .filter((t) => t.active || t.id === productTypeId)
    .map((t) => ({ value: t.id, label: t.name }));
  const franchiseSelectOptions = options.franchises
    .filter((f) => f.active || f.id === franchiseId)
    .map((f) => ({ value: f.id, label: f.name }));
  const categorySelectOptions: OptionItem[] = [
    { value: NONE, label: "Ninguna" },
    ...options.categories.filter((c) => c.active || c.id === categoryId).map((c) => ({ value: c.id, label: c.name })),
  ];

  const columns: PlatformTableColumn<ProductRow>[] = [
    {
      id: "name",
      header: "Producto",
      value: (row) => row.name,
      sortable: true,
      filter: "text",
      cell: (row) => (
        <div className="min-w-0">
          <span className="block truncate font-medium">{row.name}</span>
          {row.subtitle && <span className="block truncate text-xs text-muted-foreground">{row.subtitle}</span>}
        </div>
      ),
    },
    { id: "franchise", header: "Anime", value: (row) => row.franchiseId, sortable: true, filter: "enum", options: franchiseOptions, className: "text-muted-foreground", cell: (row) => row.franchise },
    { id: "type", header: "Tipo", value: (row) => row.productTypeId, sortable: true, filter: "enum", options: typeOptions, cell: (row) => <Badge className="border-transparent bg-secondary text-secondary-foreground capitalize">{row.productType}</Badge> },
    { id: "salePrice", header: "P. venta", value: (row) => row.salePrice, sortable: true, filter: "number", align: "right", cell: (row) => currency(row.salePrice) },
    { id: "stock", header: "Stock", value: (row) => row.stock, sortable: true, filter: "number", align: "right", cell: (row) => row.stock },
    { id: "sold", header: "Vendidos", value: (row) => row.sold, sortable: true, filter: "number", align: "right", cell: (row) => row.sold },
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => (row.hasRelations ? setBlocked(row) : setConfirmDelete(row))}
            >
              <Trash2 className="size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const selectField = (label: string, value: string, onChange: (v: string) => void, items: OptionItem[]) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona..." />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Catálogo: mangas, figuras, merch, accesorios y más."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo producto
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <PlatformDataTable
            data={products}
            columns={columns}
            rowKey={(row) => row.id}
            entity={{ singular: "producto", plural: "productos" }}
            searchPlaceholder="Buscar producto, anime o editorial..."
            searchText={(row) => `${row.name} ${row.subtitle ?? ""} ${row.franchise} ${row.productType}`}
            initialSort={{ id: "name", dir: "asc" }}
            emptyLabel="Sin productos que mostrar."
            minWidth="960px"
            manualPagination={pagination}
          />
        </CardContent>
      </Card>

      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "edit" ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            <DialogDescription>El costo de compra se registra en cada pedido, no en el producto.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="One Piece - Vol. 56" />
            </div>
            {selectField("Tipo de producto", productTypeId, setProductTypeId, typeSelectOptions)}
            {selectField("Anime / franquicia", franchiseId, setFranchiseId, franchiseSelectOptions)}
            {selectField("Categoría", categoryId || NONE, (value) => setCategoryId(value === NONE ? "" : value), categorySelectOptions)}
            <div className="space-y-2">
              <Label>Fabricante</Label>
              <Input value={manufacturer} onChange={(event) => setManufacturer(event.target.value)} placeholder="Banpresto, Bandai..." />
            </div>
            <div className="space-y-2">
              <Label>Precio de venta</Label>
              <Input type="number" step="0.01" min="0" value={salePrice} onChange={(event) => setSalePrice(event.target.value)} placeholder="45.00" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Imagen (URL)</Label>
              <Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Descripción</Label>
              <Textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Observaciones</Label>
              <Textarea rows={2} value={observations} onChange={(event) => setObservations(event.target.value)} />
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
            <DialogDescription>«{blocked?.name}» tiene pedidos, inventario o ventas asociados; no se puede eliminar.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlocked(null)}>
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este producto?</DialogTitle>
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
