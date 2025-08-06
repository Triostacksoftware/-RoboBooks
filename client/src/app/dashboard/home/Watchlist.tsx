'use client'

import React from 'react'
import Card from '../home/Card'
import Dropdown from '../home/Dropdown'

export default function Watchlist() {
  return (
    <Card title="Account Watchlist" right={<Dropdown label="Accrual" items={['Accrual', 'Cash']} />}>
      <div className="h-56" />
    </Card>
  )
}
