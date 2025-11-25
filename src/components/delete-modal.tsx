import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteCrimeCase } from "@/hooks/crime-case/useMutateCase";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Trash } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export default function DeleteModal({
  caseId,
  closeDropdown,
}: {
  caseId: number;
  closeDropdown: () => void;
}) {
  const deleteMutation = useDeleteCrimeCase(); // ✅ Hook called during render
  const [open, setOpen] = useState(false);

  const handleDeleteClick = async () => {
    // ✅ Just USE the mutation, don't create it here
    await deleteMutation.mutateAsync({ id: caseId });
    closeDropdown(); // Close the dropdown menus
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex w-full cursor-pointer items-center gap-2 rounded-sm border-red-200 bg-red-50 text-red-600">
        <Trash className="text-red-600" />
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Are you absolutely sure?
          </DialogTitle>
          <DialogDescription className="text-sm">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full justify-between gap-2">
          <Button
            className="w-1/2 cursor-pointer"
            variant="destructive"
            onClick={handleDeleteClick}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete case"}
          </Button>
          <Button
            className="w-1/2 cursor-pointer"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
