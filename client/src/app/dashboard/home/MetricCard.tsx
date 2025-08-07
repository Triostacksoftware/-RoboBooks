'use client'

import React, { useState } from 'react'
import { PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Card from '../home/Card'

interface MetricCardProps {
  title: string
  subtitle: string
  current: string
  overdue: string
}

export default function MetricCard({ title, subtitle, current, overdue }: MetricCardProps) {
  return (
    <Card className="h-full flex flex-col" title={title} right={
      <button className="inline-flex items-center gap-1 text-blue-600 hover:underline">
        <PlusIcon className="h-5 w-5" /> New
      </button>
    }>
      <p className="text-sm text-gray-600 mb-4">{subtitle}</p>

      <div className="flex-1 space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">CURRENT</span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{current}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">OVERDUE</span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{overdue}</p>
        </div>
      </div>
    </Card>
  )
}
