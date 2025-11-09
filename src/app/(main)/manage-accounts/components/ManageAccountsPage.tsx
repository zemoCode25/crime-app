import React from "react";
import Accounts from "./Accounts";
import { getPendingInvitations } from "@/server/actions/invitation";
import { getActiveUsers } from "@/server/actions/users";

export default async function ManageAccountsPage() {
  const pendingInvitationsResult = await getPendingInvitations();
  const pendingInvitations = pendingInvitationsResult.ok
    ? (pendingInvitationsResult.data ?? [])
    : [];

  console.log("Pending Invitations:", pendingInvitations);

  // Fetch active users (server action) and pass to client table for client-side features
  const usersResult = await getActiveUsers({ page: 1, pageSize: 100 });
  const users = usersResult.ok ? usersResult.data.rows : [];

  return (
    <div className="px-1 py-4">
      <Accounts pendingInvitations={pendingInvitations} users={users} />
    </div>
  );
}
