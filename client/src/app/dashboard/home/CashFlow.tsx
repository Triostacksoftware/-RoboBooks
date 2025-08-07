'use client'

import React, { useState } from 'react'
import Card from '../home/Card'
import SparkLine from '../home/SparkLine'
import Dropdown from '../home/Dropdown'

export default function CashFlow() {
  const [fy, setFy] = useState('This Fiscal Year')
  const data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Flat line for zero cash flow

  return (
    <Card title="Cash Flow" right={<Dropdown label={fy} items={['This Fiscal Year', 'Last Fiscal Year']} onChange={setFy} />}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-32">
            <SparkLine data={data} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Cash as on 01/04/2024</span>
            <span className="text-xl font-semibold">₹0.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600">Operating</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-600">Investing</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-500">Outgoing</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600 font-medium">Cash as on 31/03/2025</span>
            <span className="text-xl font-semibold">₹0.00</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
