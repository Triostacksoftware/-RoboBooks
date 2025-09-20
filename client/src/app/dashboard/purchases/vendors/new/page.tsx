import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import NewVendorForm from '../components/NewVendorForm'

const NewVendorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NewVendorForm />
    </div>
  )
}

export default NewVendorPage


// Wrapped with access guard
const PageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    {content}
  </ModuleAccessGuard>
);

export default PageWithGuard;