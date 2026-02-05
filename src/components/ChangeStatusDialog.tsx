import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
  currentStatus: string;
  orders: Array<{
    id: number;
    product_id: number | null;
    quantity: number;
    status: string | null;
    notes: string | null;
    products?: { name: string; sku: string } | null;
  }>;
}

export const ChangeStatusDialog = ({
  open,
  onOpenChange,
  invoiceNumber,
  currentStatus,
  orders,
}: ChangeStatusDialogProps) => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [cancelNote, setCancelNote] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
      setCancelNote("");
    }
  }, [open, currentStatus]);

  const handleStatusChange = async () => {
    if (selectedStatus === "cancelled") {
      setShowCancelConfirm(true);
      return;
    }

    await updateStatus(selectedStatus, null);
  };

  const handleConfirmCancel = async () => {
    if (!cancelNote.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    setShowCancelConfirm(false);
    await updateStatus("cancelled", cancelNote);
  };

  const updateStatus = async (status: string, note: string | null) => {
    setIsSubmitting(true);

    try {
      // Get order IDs for this invoice
      const orderIds = orders.map((o) => o.id);

      // Update all orders with this invoice number
      const updateData: { status: string; notes?: string } = { status };
      
      if (status === "cancelled" && note) {
        // Append cancellation reason to existing notes
        for (const order of orders) {
          const existingNotes = order.notes || "";
          const cancellationNote = `[CANCELLED: ${note}]`;
          const newNotes = existingNotes 
            ? `${existingNotes}\n${cancellationNote}` 
            : cancellationNote;
          
          const { error } = await supabase
            .from("purchase_orders")
            .update({ status, notes: newNotes })
            .eq("id", order.id);

          if (error) throw error;
        }
      } else if (status === "received") {
        // When receiving, update inventory for each order that wasn't already received
        for (const order of orders) {
          if (order.status === "received") continue; // Skip already received

          // Update order status
          const { error: orderError } = await supabase
            .from("purchase_orders")
            .update({ status })
            .eq("id", order.id);

          if (orderError) throw orderError;

          // Update product inventory
          if (order.product_id) {
            const { data: currentProduct, error: fetchError } = await supabase
              .from("products")
              .select("quantity")
              .eq("id", order.product_id)
              .single();

            if (fetchError) throw fetchError;

            const newQuantity = (currentProduct?.quantity || 0) + order.quantity;

            const { error: updateError } = await supabase
              .from("products")
              .update({
                quantity: newQuantity,
                updated_at: new Date().toISOString(),
              })
              .eq("id", order.product_id);

            if (updateError) throw updateError;

            // Record the movement
            const { error: movementError } = await supabase
              .from("movements")
              .insert({
                product_id: order.product_id,
                qty_change: order.quantity,
                reason: `Purchase Order ${invoiceNumber} received`,
              });

            if (movementError) throw movementError;
          }
        }
        toast.success(`Inventory updated! Orders marked as received.`);
      } else {
        // Just update status for pending
        const { error } = await supabase
          .from("purchase_orders")
          .update({ status })
          .in("id", orderIds);

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      
      if (status === "cancelled") {
        toast.success("Order cancelled successfully");
      } else if (status !== "received") {
        toast.success("Status updated successfully");
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Status - {invoiceNumber}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Select Status</Label>
              <RadioGroup
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending" className="font-normal cursor-pointer">
                    Pending
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="received" id="received" />
                  <Label htmlFor="received" className="font-normal cursor-pointer">
                    Received
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cancelled" id="cancelled" />
                  <Label htmlFor="cancelled" className="font-normal cursor-pointer text-destructive">
                    Cancelled
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={isSubmitting || selectedStatus === currentStatus}
            >
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this purchase order? Please provide a reason for the cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="cancelNote">Cancellation Reason *</Label>
            <Textarea
              id="cancelNote"
              value={cancelNote}
              onChange={(e) => setCancelNote(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="mt-2"
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelNote("")}>
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!cancelNote.trim()}
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
