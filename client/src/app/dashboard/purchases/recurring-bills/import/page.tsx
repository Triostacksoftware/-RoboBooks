import React from 'react';
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import ImportRecurringBillsPage from './components/ImportRecurringBillsPage';

const Page = () => {
  return (
    <>
      <ImportRecurringBillsPage />
    </>
  );
};

// Wrapped with access guard
const PageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    <Page />
  </ModuleAccessGuard>
);

export default PageWithGuard;
