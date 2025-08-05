import React from 'react'
import PurchaseOrdersHeader from './components/PurchaseOrdersHeader'
import PurchaseStartSection from './components/PurchaseStartSection'
import PurchaseOrderLifecycle from './components/PurchaseOrderLifecycle'

const page = () => {
  return (
    <>
    <PurchaseOrdersHeader/>
    <PurchaseStartSection/>
    <PurchaseOrderLifecycle/>
    </>
  )
}

export default page