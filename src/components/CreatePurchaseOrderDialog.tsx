import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { purchaseOrderSchema } from "@/lib/validation";
import { z } from "zod";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePurchaseOrderDialog = ({ open, onOpenChange }: CreatePurchaseOrderDialogProps) => {
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    supplier: "",
  });
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const quantity = parseInt(formData.quantity);
      
      if (!deliveryDate) {
        setErrors({ deliveryDate: "Delivery date is required" });
        toast.error("Please select a delivery date");
        return;
      }
      
      // Validate with Zod
      const validatedData = purchaseOrderSchema.parse({
        productName: formData.productName,
        quantity,
        supplier: formData.supplier,
        deliveryDate,
      });
      
      toast.success("Purchase order created successfully!");
      onOpenChange(false);
      setFormData({ productName: "", quantity: "", supplier: "" });
      setDeliveryDate(undefined);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the validation errors");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              maxLength={100}
              required
            />
            {errors.productName && <p className="text-sm text-destructive">{errors.productName}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="1000000"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              maxLength={100}
              required
            />
            {errors.supplier && <p className="text-sm text-destructive">{errors.supplier}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
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
            {errors.deliveryDate && <p className="text-sm text-destructive">{errors.deliveryDate}</p>}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
