'use client'

import React from 'react'
import Card from '../home/Card'

export default function Projects() {
  return (
    <Card title="Projects">
      <div className="h-56 flex items-center justify-center text-center">
        <button className="text-blue-600 hover:underline">Add Project(s) to this watchlist</button>
      </div>
    </Card>
  )
}
