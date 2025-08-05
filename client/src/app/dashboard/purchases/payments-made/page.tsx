import React from 'react'
import PaymentsHeader from './components/PaymentsHeaderProps'
import PaymentsEmptyState from './components/PaymentsEmptyState'
import VendorPaymentLifecycle from './components/VendorPaymentLifecycle'

const page = () => {
  return (
    <>
    <PaymentsHeader/>
    <PaymentsEmptyState/>
    <VendorPaymentLifecycle/>
    </>
  )
}

export default page