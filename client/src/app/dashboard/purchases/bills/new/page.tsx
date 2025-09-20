import React from 'react';
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import NewBillForm from '../components/NewBillForm';

const Page = () => {
  return (
    <>
      <NewBillForm />
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
