import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import NewPurchaseOrderForm from '../components/NewPurchaseOrderForm'

const content = () => {
  return (
    <>
    <NewPurchaseOrderForm/>
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