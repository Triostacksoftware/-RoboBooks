'use client'

import React, { useState } from 'react'
import Card from '../home/Card'
import Dropdown from '../home/Dropdown'

export default function TopExpenses() {
  const [fy, setFy] = useState('This Fiscal Year')

  return (
    <Card title="Top Expenses" right={<Dropdown label={fy} items={['This Fiscal Year', 'Last Fiscal Year']} onChange={setFy} />}>
      <div className="h-48 flex items-center justify-center text-gray-500">
        No Expenses recorded for this fiscal year.
      </div>
    </Card>
  )
}
