import React from "react";
import ManageAccountsPage from "./components/ManageAccountsPage";
import { getUser } from "@/server/actions/getUser";

export const dynamic = "force-dynamic";

export default async function page() {
  const user = await getUser();
  console.log("Current User:", user?.id);
  return (
    <div className="px-1 py-4">
      <h1 className="mb-4 text-2xl font-bold">Manage Accounts</h1>
      <ManageAccountsPage />
    </div>
  );
}
