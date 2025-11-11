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
                  <td className="p-3 text-sm">Heineken Orig/Silver</td>
                  <td className="p-3 text-sm">₱130</td>
                  <td className="p-3 text-sm font-semibold">₱140</td>
                  <td className="p-3 text-sm text-green-600">+7.7%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-sm">J.W. Black Label</td>
                  <td className="p-3 text-sm">₱2,500</td>
                  <td className="p-3 text-sm font-semibold">₱2,700</td>
                  <td className="p-3 text-sm text-green-600">+8%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-sm">Grey Goose</td>
                  <td className="p-3 text-sm">₱3,500</td>
                  <td className="p-3 text-sm font-semibold">₱3,780</td>
                  <td className="p-3 text-sm text-green-600">+8%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-sm">Patron Tequila Silver</td>
                  <td className="p-3 text-sm">₱5,000</td>
                  <td className="p-3 text-sm font-semibold">₱5,400</td>
                  <td className="p-3 text-sm text-green-600">+8%</td>
                </tr>
                <tr>
                  <td className="p-3 text-sm">Luc Belaire Luxe</td>
                  <td className="p-3 text-sm">₱3,500</td>
                  <td className="p-3 text-sm font-semibold">₱3,780</td>
                  <td className="p-3 text-sm text-green-600">+8%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Elasticity analysis shows minimal demand impact with 8% price increase on premium beverages. 
              Projected revenue increase: ₱18,750/month
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
