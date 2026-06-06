import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CustomRangeReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomRangeReportDialog = ({ open, onOpenChange }: CustomRangeReportDialogProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both a start and end date.");
      return;
    }
    if (startDate > endDate) {
      toast.error("Start date must be before end date.");
      return;
    }

    setLoading(true);
    try {
      const start = format(startDate, "yyyy-MM-dd");
      const end = format(endDate, "yyyy-MM-dd");

      const [salesRes, movementsRes, productsRes, poRes] = await Promise.all([
        supabase.from("sales").select("*, products(name)").gte("date_sold", start).lte("date_sold", end),
        supabase.from("movements").select("*, products(name)").gte("created_at", start).lte("created_at", `${end}T23:59:59`),
        supabase.from("products").select("*"),
        supabase.from("purchase_orders").select("*, products(name), suppliers(name)").gte("created_at", start).lte("created_at", `${end}T23:59:59`),
      ]);

      const sales = salesRes.data || [];
      const movements = movementsRes.data || [];
      const products = productsRes.data || [];
      const pos = poRes.data || [];

      const totalSales = sales.reduce((s, x) => s + Number(x.total_amount), 0);
      const totalItems = sales.reduce((s, x) => s + x.quantity, 0);
      const lowStock = products.filter((p) => (p.quantity || 0) <= (p.reorder_level || 0));

      const productSales: Record<string, { name: string; qty: number; amount: number }> = {};
      sales.forEach((s: any) => {
        const name = s.products?.name || "Unknown";
        if (!productSales[name]) productSales[name] = { name, qty: 0, amount: 0 };
        productSales[name].qty += s.quantity;
        productSales[name].amount += Number(s.total_amount);
      });
      const topProducts = Object.values(productSales).sort((a, b) => b.amount - a.amount).slice(0, 10);

      const doc = new jsPDF();
      const periodText = `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;

      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.text("The Camp Inventory", 14, 20);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Custom Date Range Report", 14, 32);

      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Period: ${periodText}`, 14, 40);
      doc.text(`Generated: ${format(new Date(), "MMM d, yyyy h:mm a")}`, 14, 47);

      let yPos = 60;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Summary", 14, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [["Metric", "Value"]],
        body: [
          ["Total Sales", `PHP ${totalSales.toLocaleString()}`],
          ["Transactions", sales.length.toString()],
          ["Items Sold", totalItems.toString()],
          ["Stock Movements", movements.length.toString()],
          ["Purchase Orders", pos.length.toString()],
          ["Pending Orders", pos.filter((p) => p.status === "pending").length.toString()],
          ["Received Orders", pos.filter((p) => p.status === "received").length.toString()],
          ["Low Stock Items", `${lowStock.length} of ${products.length}`],
        ],
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;

      if (topProducts.length > 0) {
        doc.setFontSize(14);
        doc.text("Top Selling Products", 14, yPos);
        yPos += 6;
        autoTable(doc, {
          startY: yPos,
          head: [["Rank", "Product", "Qty Sold", "Revenue"]],
          body: topProducts.map((p, i) => [(i + 1).toString(), p.name, p.qty.toString(), `PHP ${p.amount.toLocaleString()}`]),
          theme: "striped",
          headStyles: { fillColor: [41, 128, 185] },
        });
        yPos = (doc as any).lastAutoTable.finalY + 12;
      }

      if (pos.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text("Purchase Orders", 14, yPos);
        yPos += 6;
        autoTable(doc, {
          startY: yPos,
          head: [["PO #", "Product", "Supplier", "Qty", "Status", "Expected"]],
          body: pos.map((po: any) => [
            po.invoice_number || `PO-${po.id}`,
            po.products?.name || "N/A",
            po.suppliers?.name || "N/A",
            po.quantity.toString(),
            po.status || "pending",
            format(new Date(po.expected_delivery_date), "MMM d, yyyy"),
          ]),
          theme: "striped",
          headStyles: { fillColor: [41, 128, 185] },
        });
        yPos = (doc as any).lastAutoTable.finalY + 12;
      }

      if (lowStock.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text("Low Stock Alerts", 14, yPos);
        yPos += 6;
        autoTable(doc, {
          startY: yPos,
          head: [["Product", "SKU", "Current Stock", "Reorder Level"]],
          body: lowStock.map((p: any) => [p.name, p.sku, (p.quantity || 0).toString(), (p.reorder_level || 0).toString()]),
          theme: "striped",
          headStyles: { fillColor: [231, 76, 60] },
        });
      }

      doc.save(`custom-report-${start}_to_${end}.pdf`);
      toast.success("Report downloaded successfully!");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Custom Date Range Report
          </DialogTitle>
          <DialogDescription>
            Choose a start and end date to download a report for that period.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleDownload} disabled={loading || !startDate || !endDate} className="gap-2">
            <Download className="w-4 h-4" />
            {loading ? "Generating..." : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
