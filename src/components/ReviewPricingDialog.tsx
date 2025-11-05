import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface ReviewPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReviewPricingDialog = ({ open, onOpenChange }: ReviewPricingDialogProps) => {
  const handleApprove = () => {
    toast.success("Pricing changes approved!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Review Pricing Changes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">Product</th>
                  <th className="text-left p-3 text-sm font-semibold">Current Price</th>
                  <th className="text-left p-3 text-sm font-semibold">New Price</th>
                  <th className="text-left p-3 text-sm font-semibold">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 text-sm">Specialty Cheese Wheel</td>
                  <td className="p-3 text-sm">₱450</td>
                  <td className="p-3 text-sm font-semibold">₱486</td>
                  <td className="p-3 text-sm text-green-600">+8%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-sm">Premium Wine</td>
                  <td className="p-3 text-sm">₱1,200</td>
                  <td className="p-3 text-sm font-semibold">₱1,296</td>
                  <td className="p-3 text-sm text-green-600">+8%</td>
                </tr>
                <tr>
                  <td className="p-3 text-sm">Artisan Chocolate</td>
                  <td className="p-3 text-sm">₱280</td>
                  <td className="p-3 text-sm font-semibold">₱302</td>
                  <td className="p-3 text-sm text-green-600">+8%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Elasticity analysis shows minimal demand impact with 8% price increase. 
              Projected revenue increase: ₱12,500/month
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApprove}>Approve Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
