'use client'

import React, { useState } from 'react'
import Card from '../home/Card'
import Dropdown from '../home/Dropdown'

export default function Watchlist() {
  const [account, setAccount] = useState('Account')

  return (
    <Card title="Account Watchlist" right={<Dropdown label={account} items={['Account', 'Income', 'Expense']} onChange={setAccount} />}>
      <div className="h-56" />
    </Card>
  )
}
