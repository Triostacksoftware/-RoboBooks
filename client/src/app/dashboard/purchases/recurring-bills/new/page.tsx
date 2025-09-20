import React from 'react';
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import NewRecurringBillForm from '../components/NewRecurringBillForm';

const Page = () => {
  return (
    <>
      <NewRecurringBillForm />
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
