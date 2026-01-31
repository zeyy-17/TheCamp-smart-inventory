import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { FileText, Printer } from "lucide-react";
import { format } from "date-fns";

interface InvoiceItem {
  productName: string;
  sku: string;
  store: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PurchaseOrderInvoiceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
  supplierName: string;
  deliveryDate: Date;
  items: InvoiceItem[];
}

export const PurchaseOrderInvoice = ({
  open,
  onOpenChange,
  invoiceNumber,
  supplierName,
  deliveryDate,
  items,
}: PurchaseOrderInvoiceProps) => {
  const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] print:shadow-none print:border-none">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">Purchase Order Invoice</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 print:text-black">
          {/* Invoice Header */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Invoice #:</span>
              <span className="font-semibold">{invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Supplier:</span>
              <span className="font-medium">{supplierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expected Delivery:</span>
              <span className="font-medium">{format(deliveryDate, "MMM dd, yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date Created:</span>
              <span className="font-medium">{format(new Date(), "MMM dd, yyyy")}</span>
            </div>
          </div>

          <Separator />

          {/* Items Table */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Order Items</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 font-medium">Product</th>
                    <th className="text-center p-2 font-medium">Qty</th>
                    <th className="text-right p-2 font-medium">Price</th>
                    <th className="text-right p-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.sku} • {item.store}
                        </div>
                      </td>
                      <td className="text-center p-2">{item.quantity}</td>
                      <td className="text-right p-2">₱{item.unitPrice.toFixed(2)}</td>
                      <td className="text-right p-2 font-medium">₱{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Grand Total */}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Grand Total:</span>
            <span className="text-primary">₱{grandTotal.toFixed(2)}</span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This is an auto-generated invoice for internal tracking purposes.
          </p>
        </div>

        <DialogFooter className="print:hidden gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
