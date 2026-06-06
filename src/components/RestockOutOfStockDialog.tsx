import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, PackageX, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "./ui/scroll-area";
import { PurchaseOrderInvoice } from "./PurchaseOrderInvoice";

interface RestockOutOfStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName: string;
  mode?: "out-of-stock" | "low-stock";
}


interface InvoiceItem {
  productName: string;
  sku: string;
  store: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const generateInvoiceNumber = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const r = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `PO-${y}${m}${day}-${r}`;
};

export const RestockOutOfStockDialog = ({ open, onOpenChange, storeName, mode = "out-of-stock" }: RestockOutOfStockDialogProps) => {
  const queryClient = useQueryClient();
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [supplierId, setSupplierId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    invoiceNumber: string;
    supplierName: string;
    deliveryDate: Date;
    items: InvoiceItem[];
  } | null>(null);

  const { data: outOfStockProducts = [] } = useQuery({
    queryKey: ["restock-products", storeName, mode],
    enabled: open && !!storeName,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, cost_price, reorder_level, quantity, store")
        .eq("store", storeName)
        .order("name");
      if (error) throw error;
      const list = (data || []).filter((p: any) =>
        mode === "out-of-stock"
          ? (p.quantity ?? 0) === 0
          : (p.quantity ?? 0) > 0 && (p.quantity ?? 0) <= (p.reorder_level ?? 0)
      );
      return list;
    },
  });


  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (open) {
      const init: Record<number, string> = {};
      outOfStockProducts.forEach((p: any) => {
        init[p.id] = String(p.reorder_level || 10);
      });
      setQuantities(init);
    }
  }, [open, outOfStockProducts]);

  useEffect(() => {
    if (!open) {
      setInvoiceNumber(generateInvoiceNumber());
      setSupplierId("");
      setDeliveryDate(undefined);
      setNotes("");
      setQuantities({});
    }
  }, [open]);

  const validItems = useMemo(
    () =>
      outOfStockProducts
        .map((p: any) => ({ product: p, qty: parseInt(quantities[p.id] || "0", 10) }))
        .filter((x) => x.qty > 0),
    [outOfStockProducts, quantities]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return toast.error("Please select a supplier");
    if (!deliveryDate) return toast.error("Please select a delivery date");
    if (validItems.length === 0) return toast.error("Set a quantity for at least one product");

    try {
      const ordersToInsert = validItems.map(({ product, qty }) => ({
        invoice_number: invoiceNumber,
        product_id: product.id,
        supplier_id: parseInt(supplierId),
        quantity: qty,
        expected_delivery_date: format(deliveryDate, "yyyy-MM-dd"),
        status: "pending",
        store: storeName,
        notes: notes || null,
      }));

      const { error } = await supabase.from("purchase_orders").insert(ordersToInsert);
      if (error) throw error;

      const selectedSupplier = suppliers?.find((s) => s.id.toString() === supplierId);
      const invoiceItems: InvoiceItem[] = validItems.map(({ product, qty }) => {
        const unitPrice = product.cost_price || 0;
        return {
          productName: product.name,
          sku: product.sku || "N/A",
          store: storeName,
          quantity: qty,
          unitPrice,
          totalPrice: qty * unitPrice,
        };
      });

      setInvoiceData({
        invoiceNumber,
        supplierName: selectedSupplier?.name || "Unknown",
        deliveryDate,
        items: invoiceItems,
      });

      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-stock-by-store"] });

      const totalQty = validItems.reduce((s, x) => s + x.qty, 0);
      toast.success(`Purchase order ${invoiceNumber} created with ${totalQty} units (pending delivery).`);
      onOpenChange(false);
      setShowInvoice(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create purchase order");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {mode === "out-of-stock" ? (
                <PackageX className="w-5 h-5 text-destructive" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-warning" />
              )}
              {mode === "out-of-stock" ? "Restock Out of Stock" : "Restock Low Stock"} — {storeName}
            </DialogTitle>
            <DialogDescription>
              Create a purchase order for all {mode === "out-of-stock" ? "out-of-stock" : "low-stock"} items in this store. Set supplier, delivery date, and quantity per item.

            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice">Invoice Number</Label>
                <Input
                  id="invoice"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expected Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>{mode === "out-of-stock" ? "Out of Stock" : "Low Stock"} Items ({outOfStockProducts.length})</Label>
              <ScrollArea className="h-[260px] rounded-md border p-3">
                {outOfStockProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No {mode === "out-of-stock" ? "out-of-stock" : "low-stock"} items for {storeName}.

                  </p>
                ) : (
                  <div className="space-y-2">
                    {outOfStockProducts.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-2 rounded-md border border-border bg-card/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {p.sku || "—"} · Stock: {p.quantity ?? 0} · Reorder: {p.reorder_level ?? 0}
                          </p>

                        </div>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Qty"
                          value={quantities[p.id] ?? ""}
                          onChange={(e) =>
                            setQuantities((q) => ({ ...q, [p.id]: e.target.value }))
                          }
                          className="w-24 h-9"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={outOfStockProducts.length === 0}>
                Create Purchase Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {invoiceData && (
        <PurchaseOrderInvoice
          open={showInvoice}
          onOpenChange={setShowInvoice}
          invoiceNumber={invoiceData.invoiceNumber}
          supplierName={invoiceData.supplierName}
          deliveryDate={invoiceData.deliveryDate}
          items={invoiceData.items}
        />
      )}
    </>
  );
};
