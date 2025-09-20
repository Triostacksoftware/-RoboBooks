import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import NewPurchaseOrderForm from '../components/NewPurchaseOrderForm'

const page = () => {
  return (
    <>
    <NewPurchaseOrderForm/>
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