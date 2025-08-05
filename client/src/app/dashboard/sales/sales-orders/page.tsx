import React from 'react'
import SalesOrdersHeader from './components/SalesOrdersHeader'
import SalesOrderIntro from './components/SalesOrderIntro'
import SalesOrdersModuleInfo from './components/SalesOrdersModuleInfo'

const page = () => {
  return (
    <>
    <SalesOrdersHeader/>
    <SalesOrderIntro/>
    <SalesOrdersModuleInfo/>
    </>
  )
}

export default page