'use client'
import Card from './Card'
import ProgressBar from './ProgressBar'
import Dropdown from './Dropdown'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function MetricCard({
  title,
  subtitle,
  current,
  overdue,
}: {
  title: string
  subtitle: string
  current: string
  overdue: string
}) {
  const [period, setPeriod] = useState('This Fiscal Year')

  return (
    <Card
      title={title}
      right={
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-1 text-blue-600 hover:underline">
            <PlusIcon className="h-5 w-5" /> New
          </button>
        </div>
      }
    >
      <div className="mb-3 text-sm text-gray-600">{subtitle}</div>
      <ProgressBar value={0} />

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div>
          <div className="text-xs text-blue-600 font-medium">CURRENT</div>
          <div className="text-2xl font-semibold">{current}</div>
        </div>
        <div>
          <div className="text-xs text-orange-500 font-medium">OVERDUE</div>
          <div className="text-2xl font-semibold">{overdue}</div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <Dropdown
          label={period}
          items={['This Fiscal Year', 'Last Fiscal Year', 'Custom']}
          onChange={setPeriod}
        />
      </div>
    </Card>
  )
}
