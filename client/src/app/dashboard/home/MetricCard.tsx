'use client'

import React, { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Dropdown from '../home/Dropdown'
import Card from '../home/Card'

interface MetricCardProps {
  title: string
  subtitle: string
  current: string
  overdue: string
}

export default function MetricCard({ title, subtitle, current, overdue }: MetricCardProps) {
  const [period, setPeriod] = useState('This Fiscal Year')

  return (
    <Card className="h-full flex flex-col" title={title} right={
      <button className="inline-flex items-center gap-1 text-blue-600 hover:underline">
        <PlusIcon className="h-5 w-5" /> New
      </button>
    }>
      <p className="text-sm text-gray-600">{subtitle}</p>

      <div className="mt-4 mb-6">
        <div className="h-2 bg-gray-100 rounded-full">
          <div className="h-2 bg-blue-500 rounded-full" style={{ width: '0%' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        <div>
          <p className="text-xs text-blue-600 uppercase">Current</p>
          <p className="text-2xl font-semibold">{current}</p>
        </div>
        <div>
          <p className="text-xs text-orange-500 uppercase">Overdue</p>
          <p className="text-2xl font-semibold">{overdue}</p>
        </div>
      </div>

      <div className="mt-4 text-right">
        <Dropdown label={period} items={['This Fiscal Year', 'Last Fiscal Year', 'Custom']} onChange={setPeriod} />
      </div>
    </Card>
  )
}
