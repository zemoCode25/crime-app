import { Input } from "@/components/ui/input";
import React from "react";
import InviteUserDialog from "./InviteUserDialog";
import InvitationTable from "./InvitationTable";
import type { PendingInvitation } from "@/server/actions/invitation";

interface AccountsProps {
  pendingInvitations: PendingInvitation[];
}

export default function Accounts({ pendingInvitations }: AccountsProps) {
  return (
    <div className="flex flex-col px-10">
      <div className="flex justify-between">
        <Input
          placeholder="Search person..."
          className="w-full sm:max-w-[20rem]"
        />
        <InviteUserDialog />
      </div>
      <InvitationTable invitations={pendingInvitations} />
    </div>
  );
}
