import React from "react";
import Accounts from "./Accounts";
import { getPendingInvitations } from "@/server/actions/invitation";

export default async function ManageAccountsPage() {
  const pendingInvitationsResult = await getPendingInvitations();
  const pendingInvitations = pendingInvitationsResult.ok
    ? (pendingInvitationsResult.data ?? [])
    : [];

  console.log("Pending Invitations:", pendingInvitations);

  return (
    <div className="px-1 py-4">
      <Accounts pendingInvitations={pendingInvitations} />
    </div>
  );
}
