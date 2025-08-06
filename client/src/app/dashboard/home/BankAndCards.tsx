'use client'

import React from 'react'
import Card from '../home/Card'

export default function BankAndCards() {
  return (
    <Card title="Bank and Credit Cards">
      <div className="h-56 flex items-center justify-center text-center">
        <div>
          <p className="text-gray-600 mb-2">Yet to add Bank and Credit Card details</p>
          <button className="text-blue-600 hover:underline">Add Bank Account</button>
        </div>
      </div>
    </Card>
  )
}
