import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { forecastSchema } from "@/lib/validation";
import { z } from "zod";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AdjustForecastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdjustForecastDialog = ({ open, onOpenChange }: AdjustForecastDialogProps) => {
  const [newForecast, setNewForecast] = useState("");
  const [effectiveDate, setEffectiveDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const forecastValue = parseFloat(newForecast);
      
      if (!effectiveDate) {
        setErrors({ effectiveDate: "Effective date is required" });
        toast.error("Please select an effective date");
        return;
      }
      
      // Validate with Zod
      const validatedData = forecastSchema.parse({
        newForecast: forecastValue,
        effectiveDate,
      });
      
      toast.success(`Forecast adjusted to ${validatedData.newForecast}%`);
      onOpenChange(false);
      setNewForecast("");
      setEffectiveDate(undefined);
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
          <DialogTitle>Adjust Forecast</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newForecast">New Forecast % (-100 to 500)</Label>
            <Input
              id="newForecast"
              type="number"
              step="0.1"
              min="-100"
              max="500"
              placeholder="e.g., 35"
              value={newForecast}
              onChange={(e) => setNewForecast(e.target.value)}
              required
            />
            {errors.newForecast && <p className="text-sm text-destructive">{errors.newForecast}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Effective Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !effectiveDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {effectiveDate ? format(effectiveDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={effectiveDate}
                  onSelect={setEffectiveDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.effectiveDate && <p className="text-sm text-destructive">{errors.effectiveDate}</p>}
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
