"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/auth/auth-provider";
import {
  createCreditNoteAction,
  getCreditNoteByIdAction,
  getCreditNotesAction,
  getSuggestedCreditNoteNumberAction,
  updateCreditNoteStatusAction,
} from "@/lib/actions/creditNoteActions";
import { getSaleBySaleNumber, searchSalesAction } from "@/lib/actions/saleActions";
import { CreditNoteStatus } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Eye, Ban, ArrowLeft, RefreshCcw, Search } from "lucide-react";

const PERMISSION_MANAGE = "creditNotes:manage";
const PERMISSION_CREATE = "creditNotes:create";
const PERMISSION_READ = "creditNotes:read";
const PERMISSION_UPDATE = "creditNotes:update";

function formatCurrency(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }
  return value.toLocaleString("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function statusBadgeVariant(status: CreditNoteStatus) {
  switch (status) {
    case CreditNoteStatus.CANCELLED:
      return "destructive" as const;
    case CreditNoteStatus.DRAFT:
      return "secondary" as const;
    default:
      return "default" as const;
  }
}

type CreditNoteRecord = Awaited<ReturnType<typeof getCreditNotesAction>> extends Array<infer T>
  ? T
  : never;

type SaleRecord = Awaited<ReturnType<typeof getSaleBySaleNumber>>;

type SaleSearchRecord = Awaited<ReturnType<typeof searchSalesAction>> extends Array<infer S>
  ? S
  : never;


interface CreditNoteManagementProps {
  onBack?: () => void;
  standalone?: boolean;
}

interface CreditNoteFormItem {
  saleItemId: string;
  productId: string;
  productName: string;
  maxQuantity: number;
  quantity: number;
  unitPrice: number;
  reason?: string;
}

interface CreateCreditNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issuedById: string | null;
  onCreated: (creditNote: CreditNoteRecord) => void;
  canCreate: boolean;
}

interface CreditNoteDetailsDialogProps {
  note: CreditNoteRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateCreditNoteDialog({
  open,
  onOpenChange,
  issuedById,
  onCreated,
  canCreate,
}: CreateCreditNoteDialogProps) {
  const [saleNumber, setSaleNumber] = useState("");
  const [sale, setSale] = useState<SaleRecord | null>(null);
  const [items, setItems] = useState<CreditNoteFormItem[]>([]);
  const [creditNoteNumber, setCreditNoteNumber] = useState("");
  const [reason, setReason] = useState("");
  const [loadingSale, setLoadingSale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingSale, setIsSearchingSale] = useState(false);
  const [searchResults, setSearchResults] = useState<SaleSearchRecord[] | null>(null);

  useEffect(() => {
    if (!open) {
      setSaleNumber("");
      setSale(null);
      setItems([]);
      setCreditNoteNumber("");
      setReason("");
      setError(null);
      setIsSubmitting(false);
      setSearchResults(null);
    }
  }, [open]);

  const selectedItems = useMemo(
    () => items.filter((item) => item.quantity > 0),
    [items]
  );

  const total = useMemo(
    () => selectedItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [selectedItems]
  );

  const handleLoadSale = useCallback(
    async (saleNumberToLoad: string) => {
      if (!saleNumberToLoad) {
        setError("Debes ingresar un número de factura o venta.");
        return;
      }
      setLoadingSale(true);
      setError(null);
      try {
        const fetchedSale = await getSaleBySaleNumber(saleNumberToLoad.trim());
        if (!fetchedSale) {
          setSale(null);
          setItems([]);
          setCreditNoteNumber("");
          setError("No se encontró una venta con ese número.");
          return;
        }
        setSale(fetchedSale);
        setItems(
          (fetchedSale.saleItems ?? []).map((saleItem) => ({
            saleItemId: saleItem.id,
            productId: saleItem.productId,
            productName: saleItem.product?.name ?? "Producto",
            maxQuantity: saleItem.quantity,
            quantity: saleItem.quantity,
            unitPrice: saleItem.unitPrice,
            reason: "",
          }))
        );
        const suggested = await getSuggestedCreditNoteNumberAction(fetchedSale.id);
        setCreditNoteNumber(suggested);
      } catch (err) {
        console.error(err);
        setSale(null);
        setItems([]);
        setCreditNoteNumber("");
        setError("No se pudo cargar la venta seleccionada.");
      } finally {
        setLoadingSale(false);
      }
    },
    []
  );

  const handleSearchSales = useCallback(
    async () => {
      if (!saleNumber.trim()) {
        setSearchResults(null);
        return;
      }
      setIsSearchingSale(true);
      try {
        const results = await searchSalesAction(saleNumber.trim(), 10);
        setSearchResults(results ?? []);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
        setError("Ocurrió un error al buscar ventas.");
      } finally {
        setIsSearchingSale(false);
      }
    },
    [saleNumber]
  );

  const updateItemQuantity = (saleItemId: string, value: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.saleItemId === saleItemId
          ? {
              ...item,
              quantity: Math.min(Math.max(value, 0), item.maxQuantity),
            }
          : item
      )
    );
  };

  const updateItemReason = (saleItemId: string, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.saleItemId === saleItemId
          ? {
              ...item,
              reason: value,
            }
          : item
      )
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!issuedById) {
      setError("No se pudo identificar al usuario emisor.");
      return;
    }

    if (!sale) {
      setError("Debes seleccionar una venta válida antes de crear la nota de crédito.");
      return;
    }

    if (!selectedItems.length) {
      setError("Selecciona al menos un ítem para crear la nota de crédito.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createCreditNoteAction({
        saleId: sale.id,
        issuedById,
        creditNoteNumber: creditNoteNumber || undefined,
        reason: reason || undefined,
        items: selectedItems.map((item) => ({
          saleItemId: item.saleItemId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.unitPrice * item.quantity,
          reason: item.reason || undefined,
        })),
      });

      if (!created) {
        setError("No se pudo crear la nota de crédito.");
        return;
      }

      const createdRecord = await getCreditNoteByIdAction(created.id);
      if (createdRecord) {
        onCreated(createdRecord as CreditNoteRecord);
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error al crear la nota de crédito.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nueva Nota de Crédito</DialogTitle>
          <DialogDescription>
            Selecciona una venta y los ítems a acreditar para generar la nota.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="saleNumber">Venta / Factura</Label>
              <div className="flex gap-2">
                <Input
                  id="saleNumber"
                  value={saleNumber}
                  onChange={(event) => setSaleNumber(event.target.value)}
                  placeholder="Ingresa el número de factura"
                  disabled={loadingSale || isSubmitting}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loadingSale || isSubmitting}
                  onClick={() => handleLoadSale(saleNumber)}
                >
                  {loadingSale ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="justify-start"
                disabled={loadingSale || isSubmitting || isSearchingSale}
                onClick={handleSearchSales}
              >
                {isSearchingSale ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}Buscar ventas
              </Button>
              {searchResults && searchResults.length > 0 && (
                <div className="rounded border bg-muted/30 p-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Resultados:</p>
                  {searchResults.map((result) => (
                    <Button
                      key={result.id}
                      type="button"
                      variant="link"
                      className="h-auto px-0 text-left"
                      onClick={() => {
                        setSaleNumber(result.saleNumber ?? "");
                        handleLoadSale(result.saleNumber ?? "");
                      }}
                    >
                      {(result.saleNumber ?? "-") + " - " + (result.customer?.name ?? "Sin cliente")}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="creditNoteNumber">Número de nota de crédito</Label>
                <Input
                  id="creditNoteNumber"
                  value={creditNoteNumber}
                  onChange={(event) => setCreditNoteNumber(event.target.value)}
                  placeholder="Se generará automáticamente si se deja en blanco"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label>Total a acreditar</Label>
                <Input value={formatCurrency(total)} disabled readOnly className="font-semibold" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="generalReason">Motivo general (opcional)</Label>
              <Textarea
                id="generalReason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                placeholder="Describe el motivo general de la nota de crédito"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label>Ítems a acreditar</Label>
              {items.length === 0 ? (
                <div className="rounded border border-dashed p-6 text-center text-muted-foreground">
                  {sale
                    ? "La venta seleccionada no tiene ítems."
                    : "Busca y selecciona una venta para mostrar los ítems."}
                </div>
              ) : (
                <ScrollArea className="h-64 border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="w-32">Cantidad</TableHead>
                        <TableHead className="w-32">Máx.</TableHead>
                        <TableHead className="w-32">Precio</TableHead>
                        <TableHead className="w-32">Subtotal</TableHead>
                        <TableHead>Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.saleItemId}>
                          <TableCell className="font-medium">
                            <div>{item.productName}</div>
                            <div className="text-xs text-muted-foreground">ID: {item.saleItemId}</div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={item.maxQuantity}
                              value={item.quantity}
                              onChange={(event) =>
                                updateItemQuantity(item.saleItemId, Number(event.target.value))
                              }
                              disabled={isSubmitting}
                            />
                          </TableCell>
                          <TableCell>{item.maxQuantity}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice * item.quantity)}</TableCell>
                          <TableCell>
                            <Textarea
                              rows={2}
                              value={item.reason ?? ""}
                              placeholder="Motivo específico (opcional)"
                              onChange={(event) => updateItemReason(item.saleItemId, event.target.value)}
                              disabled={isSubmitting}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !canCreate}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>Crear nota de crédito</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreditNoteDetailsDialog({ note, open, onOpenChange }: CreditNoteDetailsDialogProps) {
  if (!note) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalle de nota de crédito</DialogTitle>
          <DialogDescription>
            {note.creditNoteNumber} — {note.sale?.saleNumber ?? "Sin número de venta"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{note.sale?.customer?.name ?? "Sin cliente"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Emitido por</p>
              <p className="font-medium">{note.issuedBy?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">
                {note.issuedAt ? new Date(note.issuedAt).toLocaleString() : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge variant={statusBadgeVariant(note.status)}>{note.status}</Badge>
            </div>
          </div>
          {note.reason && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Motivo general</p>
              <p>{note.reason}</p>
            </div>
          )}
          <ScrollArea className="h-60 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-24">Cantidad</TableHead>
                  <TableHead className="w-24">Precio</TableHead>
                  <TableHead className="w-28">Subtotal</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(note.items ?? []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product?.name ?? "Producto"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell>{formatCurrency(item.total)}</TableCell>
                    <TableCell>{item.reason ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="text-right font-semibold">
            Total acreditado: {formatCurrency(note.total)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CreditNoteManagement({ onBack, standalone = false }: CreditNoteManagementProps) {
  const { permissions, user } = useAuth();

  const canManage = permissions.includes(PERMISSION_MANAGE);
  const canCreate = canManage || permissions.includes(PERMISSION_CREATE);
  const canUpdate = canManage || permissions.includes(PERMISSION_UPDATE);
  const canRead = canManage || permissions.includes(PERMISSION_READ);

  const [creditNotes, setCreditNotes] = useState<CreditNoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<CreditNoteRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [noteToCancel, setNoteToCancel] = useState<CreditNoteRecord | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const refresh = useCallback(async () => {
    if (!canRead) {
      setCreditNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getCreditNotesAction(100, 0);
      setCreditNotes(result ?? []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las notas de crédito.");
      setCreditNotes([]);
    } finally {
      setLoading(false);
    }
  }, [canRead]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreated = (creditNote: CreditNoteRecord) => {
    setCreditNotes((prev) => [creditNote, ...prev]);
  };

  const handleViewDetails = (note: CreditNoteRecord) => {
    setSelectedNote(note);
    setDetailsOpen(true);
  };

  const handleCancelNote = async () => {
    if (!noteToCancel) {
      return;
    }
    setIsCancelling(true);
    try {
      const updated = await updateCreditNoteStatusAction(
        noteToCancel.id,
        CreditNoteStatus.CANCELLED,
        noteToCancel.reason ?? undefined
      );
      await refresh();
      setNoteToCancel(null);
      if (updated) {
        const updatedRecord = await getCreditNoteByIdAction(noteToCancel.id);
        if (updatedRecord) {
          setSelectedNote(updatedRecord as CreditNoteRecord);
        }
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo cancelar la nota de crédito.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {standalone ? (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Volver al panel
              </Button>
            </Link>
          ) : (
            onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Volver
              </Button>
            )
          )}
          <CardTitle className="text-orange-500">Notas de crédito</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={refresh} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}Recargar
          </Button>
          {canCreate && (
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nueva nota de crédito
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!canRead ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            No tienes permisos para ver las notas de crédito.
          </div>
        ) : loading ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando notas de crédito...
          </div>
        ) : creditNotes.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            No se registraron notas de crédito todavía.
          </div>
        ) : (
          <div className="overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Emisión</TableHead>
                  <TableHead className="w-40 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-mono">{note.creditNoteNumber}</TableCell>
                    <TableCell>{note.sale?.saleNumber ?? "-"}</TableCell>
                    <TableCell>{note.sale?.customer?.name ?? "Sin cliente"}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(note.total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(note.status)}>{note.status}</Badge>
                    </TableCell>
                    <TableCell>{note.issuedAt ? new Date(note.issuedAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(note)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canUpdate && note.status !== CreditNoteStatus.CANCELLED && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setNoteToCancel(note)}
                          >
                            <Ban className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </CardContent>

      <CreateCreditNoteDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        issuedById={user?.id ?? null}
        onCreated={handleCreated}
        canCreate={canCreate}
      />

      <CreditNoteDetailsDialog
        note={selectedNote}
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setSelectedNote(null);
          }
        }}
      />

      <AlertDialog open={noteToCancel !== null} onOpenChange={(open) => !open && setNoteToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar nota de crédito</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirma que deseas cancelar la nota de crédito {noteToCancel?.creditNoteNumber}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelNote} disabled={isCancelling} className="bg-red-600 hover:bg-red-700">
              {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar cancelación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
