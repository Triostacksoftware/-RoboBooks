import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import NewRecurringExpenseForm from '../components/NewRecurringExpenseForm'

const page = () => {
  return (
    <>
    <NewRecurringExpenseForm/>
    </>
  )
}

export default page


// Wrapped with access guard
const PageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    {content}
  </ModuleAccessGuard>
);

export default PageWithGuard;