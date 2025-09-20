import React from 'react'
import CustomersSection from './components/CustomersSection'
import ModuleAccessGuard from '@/components/ModuleAccessGuard'

const page = () => {
  return (
    <>
    <CustomersSection/>
    
    </>
  )
}

// Wrapped with access guard
const CustomersPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Sales">
    <page />
  </ModuleAccessGuard>
);

export default CustomersPageWithGuard 
