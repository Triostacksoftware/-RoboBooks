import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import React from 'react'
import EditVendorForm from '../../components/EditVendorForm'

const content = ({ params }: { params: { id: string } }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <EditVendorForm vendorId={params.id} />
    </div>
  )
}

// Wrapped with access guard
const PageWithGuard = ({ params }: { params: { id: string } }) => (
  <ModuleAccessGuard moduleName="Purchases">
    {content({ params })}
  </ModuleAccessGuard>
);

export default PageWithGuard;