"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { BARANGAY_OPTIONS } from "@/constants/crime-case";
import { sendInvitation } from "@/server/actions/invitation";

import {
  InvitationSchema,
  type InvitationForm,
} from "@/types/invitation-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel as FormFieldLabel,
  FormMessage,
} from "@/components/ui/form";

export default function InviteUserDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<InvitationForm>({
    resolver: zodResolver(InvitationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      role: "system_admin",
      barangay: 1,
    },
    mode: "onSubmit",
  });

  const role = form.watch("role");

  const onSubmit = async (values: InvitationForm) => {
    const res = await sendInvitation({
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      role: values.role,
      barangay: values.barangay || undefined,
    });

    if (!res.ok) {
      console.error(res.error);
      return;
    }

    form.reset({
      first_name: "",
      last_name: "",
      email: "",
      role: "system_admin",
      barangay: 1,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <MainButton>Invite admin</MainButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite an Admin</DialogTitle>
          <DialogDescription>
            Enter the details of the user you want to invite.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel>First name</FormFieldLabel>
                    <FormControl>
                      <Input
                        placeholder="Juan"
                        autoCapitalize="words"
                        autoComplete="given-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel>Last name</FormFieldLabel>
                    <FormControl>
                      <Input
                        placeholder="Dela Cruz"
                        autoCapitalize="words"
                        autoComplete="family-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  <FormFieldLabel>Email (Gmail only)</FormFieldLabel>
                  <FormControl>
                    <Input
                      id="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="user@gmail.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormFieldLabel>Role</FormFieldLabel>
                  <FormControl>
                    <RadioGroup
                      className="flex gap-4"
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="system_admin" id="role-system" />
                        <Label htmlFor="role-system">System Admin</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="barangay_admin" id="role-brgy" />
                        <Label htmlFor="role-brgy">Barangay Admin</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Barangay (conditional) */}
            {role === "barangay_admin" && (
              <FormField
                control={form.control}
                name="barangay"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormFieldLabel>Barangay</FormFieldLabel>
                    <FormControl>
                      <Select
                        // bind to RHF
                        onValueChange={(v) => field.onChange(Number(v))}
                        // Select expects string; convert number -> string
                        value={
                          field.value != null ? String(field.value) : undefined
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a barangay" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select barangay</SelectLabel>
                            {BARANGAY_OPTIONS.map((barangay) => (
                              <SelectItem
                                key={barangay.id}
                                value={String(barangay.id)}
                              >
                                {barangay.value}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="w-full pt-2">
              <DialogClose asChild className="flex-1">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="flex-1 bg-orange-600 hover:bg-amber-700"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Sending..." : "Send Invitation"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
