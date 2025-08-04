import React from 'react'
import EmptyVendors from './components/EmptyVendors'
import TypesOfContacts from './components/TypesOfContacts'
import VendorHeader from './components/VenderHeader'

const page = () => {
  return (
    <>
    <VendorHeader/>
    <EmptyVendors/>
    <TypesOfContacts/>
    </>
  )
}

export default page