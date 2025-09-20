import React from 'react';
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import ImportVendorCreditsPage from './components/ImportVendorCreditsPage';

const Page = () => {
  return (
    <>
      <ImportVendorCreditsPage />
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
