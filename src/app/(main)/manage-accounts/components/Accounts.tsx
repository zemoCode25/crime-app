import React from "react";
import InvitationTable from "./InvitationTable";
import UserTable from "./UserTable";
import type { PendingInvitation } from "@/server/actions/invitation";
import type { ActiveUserRow } from "@/server/queries/users";

interface AccountsProps {
  pendingInvitations: PendingInvitation[];
  users: ActiveUserRow[];
}

export default function Accounts({ pendingInvitations, users }: AccountsProps) {
  return (
    <div className="flex flex-col gap-4 px-10">
      {/* Active Users Table */}
      <UserTable data={users} />
      <InvitationTable invitations={pendingInvitations} />
    </div>
  );
}
