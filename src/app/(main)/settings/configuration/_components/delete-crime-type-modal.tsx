import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteCrimeTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  crimeTypeLabel?: string;
}

export default function DeleteCrimeTypeModal({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  crimeTypeLabel,
}: DeleteCrimeTypeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Crime Type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            {crimeTypeLabel ? (
              <span className="font-medium">&quot;{crimeTypeLabel}&quot;</span>
            ) : (
              "this crime type"
            )}
            ? This action cannot be undone. Crime cases using this type will have
            their type set to null.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
