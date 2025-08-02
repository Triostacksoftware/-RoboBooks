'use client'
import Card from './Card'
import Dropdown from './Dropdown'
import SparkLine from './SparkLine'
import { useState } from 'react'

export default function IncomeExpense() {
  const [fy, setFy] = useState('This Fiscal Year')
  const [mode, setMode] = useState<'Accrual' | 'Cash'>('Accrual')

  return (
    <Card
      title="Income and Expense"
      right={
        <div className="flex items-center gap-2">
          <div className="rounded-md border overflow-hidden">
            <button
              onClick={() => setMode('Accrual')}
              className={`px-3 py-1 text-sm ${mode === 'Accrual' ? 'bg-gray-100' : ''}`}
            >
              Accrual
            </button>
            <button
              onClick={() => setMode('Cash')}
              className={`px-3 py-1 text-sm ${mode === 'Cash' ? 'bg-gray-100' : ''}`}
            >
              Cash
            </button>
          </div>
          <Dropdown label={fy} items={['This Fiscal Year', 'Last Fiscal Year']} onChange={setFy} />
        </div>
      }
    >
      <div className="h-48">
        <SparkLine data={[0, 1, 1, 2, 1, 3, 2, 2, 3, 2, 2, 1]} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-5 rounded bg-green-500" />
          <div>
            <div className="text-gray-600">Income</div>
            <div className="font-semibold">₹0.00</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-5 rounded bg-red-500" />
          <div>
            <div className="text-gray-600">Expense</div>
            <div className="font-semibold">₹0.00</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-600">* Values are exclusive of taxes.</div>
        </div>
      </div>
    </Card>
  )
}
