"use client";

import React, { useState } from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import ReceiptInbox from "./components/ReceiptInbox";
import BackButton from "@/components/ui/BackButton";

const ReceiptInboxPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <BackButton href="/dashboard/purchases/expenses" label="Back to Expenses" />
      </div>
      <ReceiptInbox />
    </div>
  );
};

// Wrapped with access guard
const ReceiptInboxPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    <ReceiptInboxPage />
  </ModuleAccessGuard>
);

export default ReceiptInboxPageWithGuard;
