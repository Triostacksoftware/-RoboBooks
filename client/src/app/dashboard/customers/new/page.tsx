import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import NewCustomerForm from './components/NewCustomerForm'

const content = () => {
  return (
    <>
    <NewCustomerForm/>
    
    </>
  )
}

// Wrapped with access guard
const PageWithGuard = () => (
  <ModuleAccessGuard moduleName="Sales">
    {content()}
  </ModuleAccessGuard>
);

export default PageWithGuard;