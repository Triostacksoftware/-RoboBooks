import React from 'react';
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import ImportPaymentsPage from './components/ImportPaymentsPage';

const Page = () => {
  return (
    <>
      <ImportPaymentsPage />
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
