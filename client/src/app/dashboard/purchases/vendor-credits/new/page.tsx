import React from 'react';
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import NewVendorCreditForm from '../components/NewVendorCreditForm';

const Page = () => {
  return (
    <>
      <NewVendorCreditForm />
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
