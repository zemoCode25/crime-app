"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/utils/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { updateProfileAction } from "@/server/actions/profile";

export type ProfileClientProps = {
  email: string;
  role?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  contactNumber?: string | null;
};

function initials(first?: string | null, last?: string | null) {
  const f = (first || "").trim();
  const l = (last || "").trim();
  const init = `${f ? f[0] : ""}${l ? l[0] : ""}`.toUpperCase();
  return init || "U";
}

const ProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  contact_number: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[0-9+\-() ]{7,20}$/.test(v),
      "Enter a valid phone number",
    ),
});

type ProfileValues = z.infer<typeof ProfileSchema>;

export default function ProfileClient(props: ProfileClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      first_name: props.firstName ?? "",
      last_name: props.lastName ?? "",
      contact_number: props.contactNumber ?? "",
    },
    mode: "onBlur",
  });

  const onCancel = useCallback(() => {
    setIsEditing(false);
    form.reset({
      first_name: props.firstName ?? "",
      last_name: props.lastName ?? "",
      contact_number: props.contactNumber ?? "",
    });
  }, [form, props.firstName, props.lastName, props.contactNumber]);

  const onSubmit = useCallback(
    (values: ProfileValues) => {
      const fd = new FormData();
      fd.append("first_name", values.first_name);
      fd.append("last_name", values.last_name);
      if (values.contact_number)
        fd.append("contact_number", values.contact_number);
      startTransition(async () => {
        await updateProfileAction(fd);
        setIsEditing(false);
        router.refresh();
      });
    },
    [router],
  );

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>
              {initials(
                form.getValues("first_name"),
                form.getValues("last_name"),
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-medium">
              {form.getValues("first_name") || form.getValues("last_name")
                ? `${form.getValues("first_name")} ${form.getValues("last_name")}`.trim()
                : "Unnamed User"}
            </div>
            <div className="text-muted-foreground text-sm">{props.email}</div>
          </div>
        </div>
        <Button
          variant="secondary"
          className={`${isEditing ? "hidden" : "bg-orange-600 hover:bg-orange-700"} text-white`}
          onClick={() => setIsEditing((v) => !v)}
        >
          Update
        </Button>
      </div>

      {!isEditing ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>First name</Label>
            <div className="mt-1 rounded-md border px-3 py-2">
              {form.getValues("first_name") || "-"}
            </div>
          </div>
          <div>
            <Label>Last name</Label>
            <div className="mt-1 rounded-md border px-3 py-2">
              {form.getValues("last_name") || "-"}
            </div>
          </div>
          <div>
            <Label>Role</Label>
            <div className="bg-muted/40 mt-1 rounded-md border px-3 py-2">
              {props.role || "-"}
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <div className="bg-muted/40 mt-1 rounded-md border px-3 py-2">
              {props.email}
            </div>
          </div>
          <div>
            <Label>Contact number</Label>
            <div className="mt-1 rounded-md border px-3 py-2">
              {form.getValues("contact_number") || "-"}
            </div>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 md:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label>Role</Label>
              <Input value={props.role || ""} disabled />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={props.email} disabled />
            </div>

            <FormField
              control={form.control}
              name="contact_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact number</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!field.value || !!pending}
                      onClick={() => {
                        // Placeholder verify action; wire to real flow if available
                        console.log("Verify contact number:", field.value);
                      }}
                    >
                      Verify
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 md:col-span-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                type="submit"
                disabled={pending}
              >
                {pending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </Card>
  );
}
