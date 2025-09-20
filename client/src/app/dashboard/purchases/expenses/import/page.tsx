    "use client";

import React from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import ImportExpensesPage from "./components/ImportExpensesPage";
import BackButton from "@/components/ui/BackButton";

const ImportPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <BackButton href="/dashboard/purchases/expenses" label="Back to Expenses" />
      </div>
      <ImportExpensesPage />
    </div>
  );
};

// Wrapped with access guard
const ImportPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    <ImportPage />
  </ModuleAccessGuard>
);

export default ImportPageWithGuard;
