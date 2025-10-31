"use client";
import { Button } from "@/components/ui/button";
import MainButton from "@/components/utils/MainButton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { BARANGAY_OPTIONS_WITH_ALL } from "@/constants/crime-case";
import { useState } from "react";

export default function InviteUserDialog() {
  const [userType, setUserType] = useState("system_admin");
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <MainButton>Invite admin</MainButton>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite an Admin</DialogTitle>
            <DialogDescription>
              Enter the email address of the user you want to invite.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Gmail</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name-1">Role</Label>
              <RadioGroup defaultValue="system_admin" className="flex gap-2">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="system_admin" id="r2" />
                  <Label htmlFor="r2">System Admin</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="barangay_admin" id="r3" />
                  <Label htmlFor="r3">Barangay Admin</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name-1">Barangay</Label>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a barangay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select barangay</SelectLabel>
                    {BARANGAY_OPTIONS_WITH_ALL.map((barangay) => (
                      <SelectItem key={barangay?.id} value={barangay?.value}>
                        {barangay?.value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="w-full">
            <DialogClose className="flex-1" asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button className="flex-1" type="submit">
              Send Inivitation
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
