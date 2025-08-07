'use client'

import React from 'react'
import Card from '../home/Card'

export default function BankAndCards() {
  return (
    <Card title="Bank and Credit Cards">
      <div className="h-56 flex items-center justify-center text-center">
        <div>
          <p className="text-gray-500 mb-4">Not to add Bank and Credit Card details.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Bank Account
          </button>
        </div>
      </div>
    </Card>
  )
}
