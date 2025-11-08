import { Input } from "@/components/ui/input";
import React from "react";
import InviteUserDialog from "./InviteUserDialog";
import InvitationTable from "./InvitationTable";
import type { PendingInvitation } from "@/server/actions/invitation";
import { revalidatePath as nextRevalidatePath } from "next/cache";

interface AccountsProps {
  pendingInvitations: PendingInvitation[];
}

async function reinvalidatePath() {
  "use server";
  nextRevalidatePath("/(main)/manage-accounts/page");
}

export default function Accounts({ pendingInvitations }: AccountsProps) {
  return (
    <div className="flex flex-col px-10">
      <div className="flex justify-between">
        <Input
          placeholder="Search person..."
          className="w-full sm:max-w-[20rem]"
        />
        <InviteUserDialog reinvalidatePath={reinvalidatePath} />
      </div>
      <InvitationTable invitations={pendingInvitations} />
    </div>
  );
}
