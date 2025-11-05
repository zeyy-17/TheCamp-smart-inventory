import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: {
    name: string;
    category: string;
    quantity: number;
    reorderPoint: number;
    status: string;
  }) => void;
}

const categories = ["Beers", "Tequila", "Vodka", "Rum", "Gin", "Wine", "Whisky", "Cognac", "Single Malt", "Liquer"];

export const AddProductDialog = ({ open, onOpenChange, onAdd }: AddProductDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    reorderPoint: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(formData.quantity);
    const reorderPoint = parseInt(formData.reorderPoint);
    
    const status = quantity <= reorderPoint ? (quantity < reorderPoint * 0.5 ? "Critical" : "Low Stock") : "In Stock";
    
    onAdd({
      name: formData.name,
      category: formData.category,
      quantity,
      reorderPoint,
      status,
    });
    
    setFormData({ name: "", category: "", quantity: "", reorderPoint: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reorderPoint">Reorder Point</Label>
            <Input
              id="reorderPoint"
              type="number"
              min="0"
              value={formData.reorderPoint}
              onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
