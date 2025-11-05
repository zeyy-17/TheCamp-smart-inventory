import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState, useEffect } from "react";

interface Insight {
  type: "warning" | "opportunity" | "stock" | "revenue";
  title: string;
  description: string;
  action?: string;
}

interface EditInsightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insight: Insight | null;
  onSave: (insight: Insight) => void;
}

export const EditInsightDialog = ({ open, onOpenChange, insight, onSave }: EditInsightDialogProps) => {
  const [formData, setFormData] = useState<Insight>({
    type: "opportunity",
    title: "",
    description: "",
    action: "",
  });

  useEffect(() => {
    if (insight) {
      setFormData(insight);
    }
  }, [insight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Insight</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="action">Action Button Text</Label>
            <Input
              id="action"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
            />
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
