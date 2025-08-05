import React from 'react'
import VendorCreditsHeader from './components/VendorCreditsHeader'
import VendorCreditsEmptyState from './components/VendorCreditsEmptyState'
import VendorCreditLifecycle from './components/VendorCreditLifecycle'

const page = () => {
  return (
    <>
    <VendorCreditsHeader/>
    <VendorCreditsEmptyState/>
    <VendorCreditLifecycle/>
    
    </>
  )
}

export default page