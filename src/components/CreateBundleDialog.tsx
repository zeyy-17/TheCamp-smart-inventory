import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { toast } from "sonner";

interface CreateBundleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBundleDialog = ({ open, onOpenChange }: CreateBundleDialogProps) => {
  const [formData, setFormData] = useState({
    product1: "",
    product2: "",
    bundlePrice: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Product bundle created successfully!");
    onOpenChange(false);
    setFormData({ product1: "", product2: "", bundlePrice: "" });
  };

  const products = ["Heineken", "Corona", "Stella Artois", "Budweiser", "Premium Wine", "Vodka", "Whisky"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Product Bundle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product1">Product 1</Label>
            <Select value={formData.product1} onValueChange={(value) => setFormData({ ...formData, product1: value })}>
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
            <Label htmlFor="product2">Product 2</Label>
            <Select value={formData.product2} onValueChange={(value) => setFormData({ ...formData, product2: value })}>
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
            <Label htmlFor="bundlePrice">Bundle Price (₱)</Label>
            <Input
              id="bundlePrice"
              type="number"
              placeholder="e.g., 599"
              value={formData.bundlePrice}
              onChange={(e) => setFormData({ ...formData, bundlePrice: e.target.value })}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Bundle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
