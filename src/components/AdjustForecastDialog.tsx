import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface AdjustForecastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdjustForecastDialog = ({ open, onOpenChange }: AdjustForecastDialogProps) => {
  const [formData, setFormData] = useState({
    newForecast: "",
    effectiveDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Forecast adjusted to ${formData.newForecast}%`);
    onOpenChange(false);
    setFormData({ newForecast: "", effectiveDate: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Forecast</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newForecast">New Forecast %</Label>
            <Input
              id="newForecast"
              type="number"
              placeholder="e.g., 35"
              value={formData.newForecast}
              onChange={(e) => setFormData({ ...formData, newForecast: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="effectiveDate">Effective Date</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Apply Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
