import React from 'react';
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import NewPaymentForm from '../components/NewPaymentForm';

const Page = () => {
  return (
    <>
      <NewPaymentForm />
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
