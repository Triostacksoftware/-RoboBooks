import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import ImportPurchaseOrdersPage from './components/ImportPurchaseOrdersPage'

const page = () => {
  return (
    <>
    <ImportPurchaseOrdersPage/>
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