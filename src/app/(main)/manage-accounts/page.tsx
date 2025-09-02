import React from "react";
import ManageAccountsPage from "./components/ManageAccountsPage";

export default function page() {
  return (
    <div className="px-1 py-4">
      <h1 className="mb-4 text-2xl font-bold">Manage Accounts</h1>
      <ManageAccountsPage />
    </div>
  );
}
