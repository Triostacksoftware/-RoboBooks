import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import NewCustomerForm from './components/NewCustomerForm'

const page = () => {
  return (
    <>
    <NewCustomerForm/>
    
    </>
  )
}

export default page 


// Wrapped with access guard
const PageWithGuard = () => (
  <ModuleAccessGuard moduleName="Sales">
    {content}
  </ModuleAccessGuard>
);

export default PageWithGuard;