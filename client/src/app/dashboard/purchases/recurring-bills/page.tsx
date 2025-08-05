import React from 'react'
import RecurringBillsHeader from './components/RecurringBillsHeaderProps'
import RecurringBillsEmptyState from './components/RecurringBillsEmptyState'
import RecurringBillLifecycle from './components/RecurringBillLifecycle'

const page = () => {
  return (
    <>
      <RecurringBillsHeader/>
      <RecurringBillsEmptyState/>
      <RecurringBillLifecycle/>



    </>
  )
}

export default page