import React from 'react'
import EditVendorForm from '../../components/EditVendorForm'

const EditVendorPage = ({ params }: { params: { id: string } }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <EditVendorForm vendorId={params.id} />
    </div>
  )
}

export default EditVendorPage
