import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteEvent } from "../api/events";
import type { Event } from "../api/types";
import { getErrorMessage } from "@/api/types";

interface DeleteEventDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteEventDialog({
  event,
  open,
  onOpenChange,
  onDeleted,
}: DeleteEventDialogProps) {
  const deleteMutation = useDeleteEvent();

  if (!event) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(event.id);
      toast.success("Event deleted successfully");
      onOpenChange(false);
      onDeleted?.();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete event"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Event?</DialogTitle>
          <DialogDescription className="space-y-2">
            <span>
              Are you sure you want to delete{" "}
              <strong className="text-foreground font-semibold">
                "{event.title}"
              </strong>
              ? This action cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
            className="font-bold cursor-pointer"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
