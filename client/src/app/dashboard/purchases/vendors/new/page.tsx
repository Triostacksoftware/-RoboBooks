import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import NewVendorForm from '../components/NewVendorForm'

const content = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NewVendorForm />
    </div>
  )
}

// Wrapped with access guard
const PageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    {content()}
  </ModuleAccessGuard>
);

export default PageWithGuard;