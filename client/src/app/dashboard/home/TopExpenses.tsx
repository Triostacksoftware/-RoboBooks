'use client'

import React from 'react'
import Card from '../home/Card'
import Dropdown from '../home/Dropdown'

export default function TopExpenses() {
  return (
    <Card title="Top Expenses" right={<Dropdown label="This Fiscal Year" items={['This Fiscal Year', 'Last Fiscal Year']} />}>
      <div className="h-48 flex items-center justify-center text-gray-400">
        No Expense recorded for this fiscal year
      </div>
    </Card>
  )
}
