"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Plus, Power } from "lucide-react";
import { toast } from "sonner";

import { createSupplier } from "@/actions/catalogs/create-catalogs";
import { getSupplierDetailAction, toggleSupplier, updateSupplier, type SupplierDetail } from "@/actions/catalogs/suppliers";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currency } from "@/lib/money/format";
import { formatDate } from "@/server/shared/format";

type SupplierRow = {
  id: string;
  name: string;
  contact: string | null;
  website: string | null;
  active: boolean;
  ordersCount: number;
  total: number;
  last: Date | null;
};

type DialogState = { mode: "create" } | { mode: "edit"; supplier: SupplierRow } | null;

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  ORDER_PLACED: { label: "Pedido realizado", className: "border-transparent bg-secondary text-secondary-foreground" },
  IN_TRANSIT: { label: "En camino", className: "border-transparent bg-secondary text-secondary-foreground" },
  RECEIVED: { label: "Recibido", className: "border-transparent bg-primary-softer text-primary" },
};

function orderStatusLabel(status: string) {
  return ORDER_STATUS[status]?.label ?? status;
}

function orderStatusClass(status: string) {
  return ORDER_STATUS[status]?.className ?? "border-transparent bg-secondary text-secondary-foreground";
}

function websiteHref(website: string) {
  return website.startsWith("http") ? website : `https://${website}`;
}

export function SuppliersManager({ suppliers, pagination }: { suppliers: SupplierRow[]; pagination: PlatformTableManualPagination }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupplierDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setName("");
    setContact("");
    setWebsite("");
    setDialog({ mode: "create" });
  };

  const openEdit = (supplier: SupplierRow) => {
    setName(supplier.name);
    setContact(supplier.contact ?? "");
    setWebsite(supplier.website ?? "");
    setDialog({ mode: "edit", supplier });
  };

  const openDetail = async (id: string) => {
    setDetailId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      setDetail(await getSupplierDetailAction(id));
    } catch {
      toast.error("No se pudo cargar el detalle.");
      setDetailId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Ingresa un nombre.");
      return;
    }
    setSaving(true);
    try {
      if (dialog?.mode === "edit") {
        const result = await updateSupplier(dialog.supplier.id, {
          name: trimmedName,
          contact: contact.trim() || null,
          website: website.trim() || null,
        });
        if (result.ok) {
          toast.success("Proveedor guardado");
          setDialog(null);
        } else {
          toast.error(result.error);
        }
      } else {
        await createSupplier({
          name: trimmedName,
          contact: contact.trim() || undefined,
          website: website.trim() || undefined,
        });
        toast.success("Proveedor creado");
        setDialog(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el proveedor.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (row: SupplierRow) => {
    const result = await toggleSupplier(row.id, !row.active);
    if (result.ok) toast.success(row.active ? "Desactivado" : "Activado");
    else toast.error(result.error);
  };

  const columns: PlatformTableColumn<SupplierRow>[] = [
    {
      id: "name",
      header: "Proveedor",
      value: (row) => row.name,
      sortable: true,
      filter: "text",
      className: "font-medium",
      cell: (row) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => openDetail(row.id)}
            className="block truncate text-left font-medium text-primary hover:underline"
          >
            {row.name}
          </button>
          {row.website && (
            <a
              href={websiteHref(row.website)}
              target="_blank"
              rel="noreferrer"
              className="block max-w-56 truncate text-xs text-muted-foreground hover:underline"
            >
              {row.website}
            </a>
          )}
        </div>
      ),
    },
    { id: "contact", header: "Contacto", value: (row) => row.contact, sortable: true, filter: "text", cell: (row) => row.contact || "—" },
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
    { id: "ordersCount", header: "Pedidos", value: (row) => row.ordersCount, sortable: true, filter: "number", align: "right", cell: (row) => row.ordersCount },
    { id: "total", header: "Total comprado", value: (row) => row.total, sortable: true, filter: "number", align: "right", cell: (row) => currency(row.total) },
    { id: "last", header: "Última compra", value: (row) => row.last, sortable: true, filter: "date", cell: (row) => formatDate(row.last) },
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
            <DropdownMenuItem onClick={() => openDetail(row.id)}>
              <Eye className="size-4" />
              Ver detalle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row)}>
              <Pencil className="size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggle(row)}>
              <Power className="size-4" />
              {row.active ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Proveedores"
        description="Tiendas y distribuidores a los que les compras la mercadería."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo proveedor
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <PlatformDataTable
            data={suppliers}
            columns={columns}
            rowKey={(row) => row.id}
            entity={{ singular: "proveedor", plural: "proveedores" }}
            searchPlaceholder="Buscar por nombre, contacto o página..."
            searchText={(row) => `${row.name} ${row.contact ?? ""} ${row.website ?? ""}`}
            initialSort={{ id: "name", dir: "asc" }}
            emptyLabel="No se encontraron proveedores."
            minWidth="900px"
            manualPagination={pagination}
          />
        </CardContent>
      </Card>

      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "edit" ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
            <DialogDescription>Tienda o distribuidor del que compras mercadería.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSave()}
                placeholder="Anime Store"
              />
            </div>
            <div className="space-y-2">
              <Label>Contacto</Label>
              <Input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="WhatsApp, correo o persona"
              />
            </div>
            <div className="space-y-2">
              <Label>Página</Label>
              <Input
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://tienda.com"
              />
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

      <Dialog open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          {detailLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Cargando...</p>
          ) : detail ? (
            <>
              <DialogHeader>
                <DialogTitle>{detail.name}</DialogTitle>
                <DialogDescription>
                  Proveedor · {detail.active ? "Activo" : "Inactivo"}
                </DialogDescription>
              </DialogHeader>
              <dl className="grid gap-3 rounded-xl bg-muted/50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Contacto</dt>
                  <dd className="break-words font-medium">{detail.contact || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Página</dt>
                  <dd className="break-words font-medium">
                    {detail.website ? (
                      <a
                        href={websiteHref(detail.website)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        {detail.website}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              </dl>
              <div>
                <p className="mb-2 font-semibold">Historial de pedidos</p>
                {detail.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aún no hay pedidos con este proveedor.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Unidades</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Link href={`/pedidos/${order.id}`} className="font-medium text-primary hover:underline">
                              {order.code}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(order.orderDate)}</TableCell>
                          <TableCell>
                            <Badge className={orderStatusClass(order.status)}>{orderStatusLabel(order.status)}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{order.units}</TableCell>
                          <TableCell className="text-right tabular-nums">{currency(order.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No se encontró el proveedor.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
