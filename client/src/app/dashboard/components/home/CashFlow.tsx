'use client'
import Card from './Card'
import SparkLine from './SparkLine'
import Dropdown from './Dropdown'
import { useState } from 'react'

export default function CashFlow() {
  const [fy, setFy] = useState('This Fiscal Year')
  const data = [0, 2, 1, 4, 3, 5, 3, 4, 2, 3, 2, 4, 3]

  return (
    <Card
      title="Cash Flow"
      right={<Dropdown label={fy} items={['This Fiscal Year', 'Last Fiscal Year']} onChange={setFy} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SparkLine data={data} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Cash as on 01/04/2025</span>
            <span className="text-xl font-semibold">₹0.00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-green-600">Incoming</span>
            <span>₹0.00 +</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-red-500">Outgoing</span>
            <span>₹0.00 -</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
