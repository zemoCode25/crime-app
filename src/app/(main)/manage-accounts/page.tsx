import React from "react";
import ManageAccountsPage from "./components/ManageAccountsPage";
import { getUser } from "@/server/actions/getUser";

export const dynamic = "force-dynamic";

export default async function page() {
  const user = await getUser();
  console.log("Current User:", user?.id);
  return (
    <div className="px-1 py-4">
      <ManageAccountsPage />
    </div>
  );
}
