import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import ImportRecurringExpensesPage from './components/ImportRecurringExpensesPage'

const content = () => {
  return (
    <>
    <ImportRecurringExpensesPage/>
    </>
  )
}

// Wrapped with access guard
const PageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    {content()}
  </ModuleAccessGuard>
);

export default PageWithGuard;