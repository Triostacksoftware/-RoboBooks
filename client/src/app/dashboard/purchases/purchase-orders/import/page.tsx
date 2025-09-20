import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import ImportPurchaseOrdersPage from './components/ImportPurchaseOrdersPage'

const content = () => {
  return (
    <>
    <ImportPurchaseOrdersPage/>
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