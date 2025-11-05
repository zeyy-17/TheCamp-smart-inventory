import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { toast } from "sonner";

interface PlanPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlanPromotionDialog = ({ open, onOpenChange }: PlanPromotionDialogProps) => {
  const [formData, setFormData] = useState({
    targetProduct: "",
    discount: "",
    duration: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Promotion campaign planned successfully!");
    onOpenChange(false);
    setFormData({ targetProduct: "", discount: "", duration: "" });
  };

  const products = ["Imported Wine Bottles", "Heineken", "Corona", "Premium Vodka", "Whisky Collection"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Plan Promotion Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetProduct">Target Product</Label>
            <Select value={formData.targetProduct} onValueChange={(value) => setFormData({ ...formData, targetProduct: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discount">Discount %</Label>
            <Input
              id="discount"
              type="number"
              placeholder="e.g., 20"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="e.g., 14"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Campaign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
