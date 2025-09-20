import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import NewRecurringExpenseForm from '../components/NewRecurringExpenseForm'

const content = () => {
  return (
    <>
    <NewRecurringExpenseForm/>
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