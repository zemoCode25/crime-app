import { Input } from "@/components/ui/input";
import React from "react";
import InviteUserDialog from "./InviteUserDialog";
import InvitationTable from "./InvitationTable";
import UserTable from "./UserTable";
import type { PendingInvitation } from "@/server/actions/invitation";
import type { ActiveUserRow } from "@/server/queries/users";
import { revalidatePath as nextRevalidatePath } from "next/cache";

interface AccountsProps {
  pendingInvitations: PendingInvitation[];
  users: ActiveUserRow[];
}

async function reinvalidatePath() {
  "use server";
  nextRevalidatePath("/(main)/manage-accounts/page");
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
