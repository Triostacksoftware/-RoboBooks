"use client";

import React from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import RecordExpensePage from "./components/RecordExpensePage";

const RecordPage = () => {
  return (
    <div>
      <RecordExpensePage />
    </div>
  );
};

// Wrapped with access guard
const RecordPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    <RecordPage />
  </ModuleAccessGuard>
);

export default RecordPageWithGuard;
