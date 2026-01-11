import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Zod schema for adding a new crime type
const addCrimeTypeSchema = z.object({
  label: z
    .string()
    .min(1, "Crime type label is required")
    .max(100, "Label must not exceed 100 characters"),
});

type AddCrimeTypeFormData = z.infer<typeof addCrimeTypeSchema>;

interface AddCrimeTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddCrimeTypeFormData) => void;
  isAdding: boolean;
}

export default function AddCrimeTypeModal({
  open,
  onOpenChange,
  onSubmit,
  isAdding,
}: AddCrimeTypeModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCrimeTypeFormData>({
    resolver: zodResolver(addCrimeTypeSchema),
    defaultValues: {
      label: "",
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const handleFormSubmit = (data: AddCrimeTypeFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Crime Type</DialogTitle>
          <DialogDescription>
            Enter the label for the new crime type.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Label</label>
            <Input
              {...register("label")}
              placeholder="e.g., Robbery"
              disabled={isAdding}
            />
            {errors.label && (
              <p className="text-xs text-red-500">{errors.label.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isAdding}
              className="border border-orange-800 bg-orange-100 text-orange-800 hover:bg-orange-200"
            >
              {isAdding ? "Adding..." : "Add crime type"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export type { AddCrimeTypeFormData };
