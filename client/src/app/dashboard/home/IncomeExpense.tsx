'use client'

import React, { useState } from 'react'
import Card from '../home/Card'
import SparkLine from '../home/SparkLine'
import Dropdown from '../home/Dropdown'

export default function IncomeExpense() {
  const [fy, setFy] = useState('This Fiscal Year')
  const data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Zero data for empty state

  return (
    <Card title="Income and Expense" right={
      <Dropdown label={fy} items={['This Fiscal Year', 'Last Fiscal Year']} onChange={setFy} />
    }>
      <div className="h-40 mb-4">
        <SparkLine data={data} />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mb-4">
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
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-5 rounded bg-green-500 inline-block" />
          <div>
            <p className="text-gray-600">Total Income</p>
            <p className="font-semibold">₹0.00</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-5 rounded bg-red-500 inline-block" />
          <div>
            <p className="text-gray-600">Total Expenses</p>
            <p className="font-semibold">₹0.00</p>
          </div>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-600">
        *Income and expenses displayed are inclusive of taxes.
      </div>
    </Card>
  )
}
