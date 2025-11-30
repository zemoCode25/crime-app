"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { logOutUser } from "@/server/actions/users";

export default function LogoutModal() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-fit">Log out</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <h1 className="text-lg font-semibold">Are you absolutely sure?</h1>
          </DialogTitle>
          <DialogDescription asChild>
            <p className="text-sm">
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full justify-between gap-2">
          <Button
            className="flex-1 cursor-pointer"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <form action={logOutUser} className="flex-1">
            <Button className="w-full cursor-pointer" type="submit">
              Log out
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
