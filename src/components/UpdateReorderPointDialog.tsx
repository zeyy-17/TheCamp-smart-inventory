import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { useState } from "react";
import { toast } from "sonner";

interface UpdateReorderPointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpdateReorderPointDialog = ({ open, onOpenChange }: UpdateReorderPointDialogProps) => {
  const [reorderPoint, setReorderPoint] = useState([100]);

  const handleSubmit = () => {
    toast.success(`Reorder point updated to ${reorderPoint[0]} units`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Reorder Point</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>Reorder Quantity</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={reorderPoint}
                onValueChange={setReorderPoint}
                min={50}
                max={200}
                step={5}
                className="flex-1"
              />
              <span className="text-2xl font-bold w-20 text-right">{reorderPoint[0]}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Current: 100 units | Recommended: 125 units
            </p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Impact Analysis</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Based on 90-day trend analysis</li>
              <li>• Reduces stockout risk by 35%</li>
              <li>• Optimal balance of stock holding costs</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Reorder Point</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
