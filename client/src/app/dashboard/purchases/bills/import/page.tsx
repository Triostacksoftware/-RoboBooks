import React from 'react';
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import ImportBillsPage from './components/ImportBillsPage';

const Page = () => {
  return (
    <>
      <ImportBillsPage />
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
