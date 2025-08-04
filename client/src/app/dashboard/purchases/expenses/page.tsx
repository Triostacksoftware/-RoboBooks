import React from 'react'
import ExpensesHeader from './components/ExpensesHeader'
import ExpensesIntroSection from './components/ExpensesIntroSection'
import ExpenseLifeCycle from './components/ExpenseLifeCycle'
import ExpensesModuleBullets from './components/ExpensesModuleBullets'

const page = () => {
  return (
   <>
   <ExpensesHeader/>
   <ExpensesIntroSection/>
   <ExpenseLifeCycle/>
   <ExpensesModuleBullets/>
   </>
  )
}

export default page