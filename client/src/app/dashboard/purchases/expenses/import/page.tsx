    "use client";

import React from "react";
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

export default ImportPage;
