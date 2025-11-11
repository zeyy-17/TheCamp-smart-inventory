import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState, useEffect } from "react";
import { productSchema } from "@/lib/validation";
import { toast } from "sonner";
import { z } from "zod";

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  reorderPoint: number;
  status: string;
  lastUpdated: string;
}

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onEdit: (id: number, product: Partial<Product>) => void;
}

const categories = ["Beers", "Tequila", "Vodka", "Rum", "Gin", "Wine", "Whisky", "Cognac", "Single Malt", "Liquer"];

export const EditProductDialog = ({ open, onOpenChange, product, onEdit }: EditProductDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    reorderPoint: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        quantity: product.quantity.toString(),
        reorderPoint: product.reorderPoint.toString(),
      });
      setErrors({});
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
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
      
      onEdit(product.id, {
        name: validatedData.name,
        category: validatedData.category,
        quantity: validatedData.quantity,
        reorderPoint: validatedData.reorderPoint,
        status,
        lastUpdated: "Just now",
      });
      
      onOpenChange(false);
      toast.success("Product updated successfully");
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
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Product Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={100}
              required
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
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
            <Label htmlFor="edit-quantity">Quantity</Label>
            <Input
              id="edit-quantity"
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
            <Label htmlFor="edit-reorderPoint">Reorder Point</Label>
            <Input
              id="edit-reorderPoint"
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
