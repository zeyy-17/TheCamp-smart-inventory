import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { productSchema } from "@/lib/validation";
import { toast } from "sonner";
import { z } from "zod";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const quantity = parseInt(formData.quantity);
      const reorderPoint = parseInt(formData.reorderPoint);
      
      // Validate with Zod
      const validatedData = productSchema.parse({
        name: formData.name,
        category: formData.category,
        quantity,
        reorderPoint,
      });
      
      const status = validatedData.quantity <= validatedData.reorderPoint 
        ? (validatedData.quantity < validatedData.reorderPoint * 0.5 ? "Critical" : "Low Stock") 
        : "In Stock";
      
      onAdd({
        name: validatedData.name,
        category: validatedData.category,
        quantity: validatedData.quantity,
        reorderPoint: validatedData.reorderPoint,
        status,
      });
      
      setFormData({ name: "", category: "", quantity: "", reorderPoint: "" });
      onOpenChange(false);
      toast.success("Product added successfully");
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
              maxLength={100}
              required
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              max="1000000"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reorderPoint">Reorder Point</Label>
            <Input
              id="reorderPoint"
              type="number"
              min="0"
              max="100000"
              value={formData.reorderPoint}
              onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
              required
            />
            {errors.reorderPoint && <p className="text-sm text-destructive">{errors.reorderPoint}</p>}
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
